import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _boostAbi from '../../../../config/abi/boost.json';
import _erc20Abi from '../../../../config/abi/erc20.json';
import _multicallAbi from '../../../../config/abi/multicall.json';
import Web3 from 'web3';
import { VaultGov } from '../../entities/vault';
import { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../../utils/types-utils';
import { BoostEntity } from '../../entities/boost';
import { isTokenBoost, isTokenErc20, isTokenNative, TokenEntity } from '../../entities/token';
import {
  BoostBalance,
  FetchAllBalancesResult,
  GovVaultPoolBalance,
  IBalanceApi,
  TokenBalance,
} from './balance-types';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];
const erc20Abi = _erc20Abi as AbiItem[];
const multicallAbi = _multicallAbi as AbiItem[];

/**
 * Get vault contract data
 */
export class BalanceAPI implements IBalanceApi {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchAllBalances(
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const { calls: tokenCalls, formatter: tokensFormatter } = this._getTokensCallsAndFormatter(
      mc,
      tokens,
      walletAddress
    );
    const { calls: govVaultCalls, formatter: govVaultFormatter } =
      this._getGovVaultCallsAndFormatter(govVaults, walletAddress);
    const { calls: boostsCalls, formatter: boostsFormatter } = this._getBoostCallsAndFormatter(
      boosts,
      walletAddress
    );

    const calls = [...tokenCalls, ...govVaultCalls, ...boostsCalls];

    type ResultType =
      | ({ type: 'boost' } & AllValuesAsString<BoostBalance>)
      | ({ type: 'vault-gov' } & AllValuesAsString<GovVaultPoolBalance>)
      | ({ type: 'token' } & AllValuesAsString<TokenBalance>);
    const [results] = (await mc.all([calls])) as ResultType[][];

    const res: FetchAllBalancesResult = {
      boosts: [],
      govVaults: [],
      tokens: [],
    };
    for (const result of results) {
      if (result.type === 'boost') {
        res.boosts.push(boostsFormatter(result));
      } else if (result.type === 'vault-gov') {
        res.govVaults.push(govVaultFormatter(result));
      } else if (result.type === 'token') {
        res.tokens.push(tokensFormatter(result));
      } else {
        console.error(result);
        throw new Error(`Could not identify type`);
      }
    }
    // format strings as numbers
    return res;
  }

  protected _getTokensCallsAndFormatter(
    mc: MultiCall,
    tokens: TokenEntity[],
    walletAddress: string
  ) {
    const calls: ShapeWithLabel[] = [];
    for (const token of tokens) {
      // skip virtual boost tokens
      if (isTokenBoost(token)) {
        console.info(`BalanceAPI.fetchTokenBalanceByChain: Skipping boost token ${token.id}`);
        continue;
      }

      if (isTokenNative(token)) {
        const tokenContract = new this.web3.eth.Contract(multicallAbi, mc.contract);
        calls.push({
          type: 'token',
          tokenId: token.id,
          amount: tokenContract.methods.getEthBalance(walletAddress),
        });
      } else if (isTokenErc20(token)) {
        // TODO: temporary check until we can sort out the WFTM mystery
        if (!token.contractAddress) {
          console.error(`Could not find token contractAddress: ${token.id}`);
          continue;
        }
        const tokenContract = new this.web3.eth.Contract(erc20Abi, token.contractAddress);
        calls.push({
          type: 'token',
          tokenId: token.id,
          amount: tokenContract.methods.balanceOf(walletAddress),
        });
      } else {
        throw new Error(
          "BalanceAPI.fetchTokenBalanceByChain: I don't know how to fetch token balance"
        );
      }
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<TokenBalance>): TokenBalance => {
        return {
          tokenId: result.tokenId,
          amount: new BigNumber(result.amount),
        };
      },
    };
  }

  protected _getGovVaultCallsAndFormatter(govVaults: VaultGov[], walletAddress: string) {
    const calls: ShapeWithLabel[] = [];

    for (const vault of govVaults) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const poolContract = new this.web3.eth.Contract(boostAbi, vault.earnContractAddress);
      calls.push({
        type: 'vault-gov',
        vaultId: vault.id,
        balance: poolContract.methods.balanceOf(walletAddress),
        rewards: poolContract.methods.earned(walletAddress),
      });
    }
    return {
      calls,
      formatter: (result: AllValuesAsString<GovVaultPoolBalance>): GovVaultPoolBalance => {
        return {
          vaultId: result.vaultId,
          balance: new BigNumber(result.balance),
          rewards: new BigNumber(result.rewards),
        };
      },
    };
  }

  protected _getBoostCallsAndFormatter(boosts: BoostEntity[], walletAddress) {
    const calls: ShapeWithLabel[] = [];

    for (const boost of boosts) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const earnContract = new this.web3.eth.Contract(boostAbi, boost.earnContractAddress);
      calls.push({
        type: 'boost',
        boostId: boost.id,
        balance: earnContract.methods.balanceOf(walletAddress),
        rewards: earnContract.methods.earned(walletAddress),
      });
    }

    return {
      calls,
      formatter: (result: AllValuesAsString<BoostBalance>): BoostBalance => {
        return {
          boostId: result.boostId,
          balance: new BigNumber(result.balance),
          rewards: new BigNumber(result.rewards),
        };
      },
    };
  }
}
