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
import { isTokenErc20, isTokenNative, TokenEntity } from '../../entities/token';
import {
  BoostBalance,
  FetchAllBalancesResult,
  GovVaultPoolBalance,
  IBalanceApi,
  TokenBalance,
} from './balance-types';
import { BeefyState } from '../../../../redux-types';
import {
  selectBoostBalanceTokenEntity,
  selectBoostRewardsTokenEntity,
  selectGovVaultBalanceTokenEntity,
  selectGovVaultRewardsTokenEntity,
} from '../../selectors/balance';
import { selectTokenById } from '../../selectors/tokens';

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
    state: BeefyState,
    tokens: TokenEntity[],
    govVaults: VaultGov[],
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<FetchAllBalancesResult> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

    const tokenCalls: ShapeWithLabel[] = [];
    for (const token of tokens) {
      if (isTokenNative(token)) {
        const tokenContract = new this.web3.eth.Contract(multicallAbi, mc.contract);
        tokenCalls.push({
          type: 'token',
          tokenId: token.id,
          amount: tokenContract.methods.getEthBalance(walletAddress),
        });
      } else if (isTokenErc20(token)) {
        const tokenContract = new this.web3.eth.Contract(erc20Abi, token.contractAddress);
        tokenCalls.push({
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

    const govVaultCalls: ShapeWithLabel[] = [];
    for (const vault of govVaults) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const poolContract = new this.web3.eth.Contract(boostAbi, vault.earnContractAddress);
      govVaultCalls.push({
        type: 'vault-gov',
        vaultId: vault.id,
        balance: poolContract.methods.balanceOf(walletAddress),
        rewards: poolContract.methods.earned(walletAddress),
      });
    }

    const boostsCalls: ShapeWithLabel[] = [];
    for (const boost of boosts) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const earnContract = new this.web3.eth.Contract(boostAbi, boost.earnContractAddress);
      boostsCalls.push({
        type: 'boost',
        boostId: boost.id,
        balance: earnContract.methods.balanceOf(walletAddress),
        rewards: earnContract.methods.earned(walletAddress),
      });
    }

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
        const balanceToken = selectBoostBalanceTokenEntity(state, result.boostId);
        const rewardsToken = selectBoostRewardsTokenEntity(state, result.boostId);
        const rawRewards = new BigNumber(result.rewards);
        const rawBalance = new BigNumber(result.balance);
        const balance = {
          boostId: result.boostId,
          balance: rawBalance.shiftedBy(-balanceToken.decimals),
          rewards: rawRewards.shiftedBy(-rewardsToken.decimals),
        };
        res.boosts.push(balance);
      } else if (result.type === 'vault-gov') {
        // apply token decimals to balance and rewards
        const balanceToken = selectGovVaultBalanceTokenEntity(state, result.vaultId);
        const rewardsToken = selectGovVaultRewardsTokenEntity(state, result.vaultId);
        const rawBalance = new BigNumber(result.balance);
        const rawRewards = new BigNumber(result.rewards);
        const balance = {
          vaultId: result.vaultId,
          balance: rawBalance.shiftedBy(-balanceToken.decimals),
          rewards: rawRewards.shiftedBy(-rewardsToken.decimals),
        };
        res.govVaults.push(balance);
      } else if (result.type === 'token') {
        // apply token decimals to amount
        const token = selectTokenById(state, this.chain.id, result.tokenId);
        const rawAmount = new BigNumber(result.amount);
        const balance = {
          tokenId: result.tokenId,
          amount: rawAmount.shiftedBy(-token.decimals),
        };
        res.tokens.push(balance);
      } else {
        console.error(result);
        throw new Error(`Could not identify type`);
      }
    }
    // format strings as numbers
    return res;
  }
}
