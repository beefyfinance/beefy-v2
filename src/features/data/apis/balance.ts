import { MultiCall, ShapeWithLabel } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import _boostAbi from '../../../config/abi/boost.json';
import _erc20Abi from '../../../config/abi/erc20.json';
import _multicallAbi from '../../../config/abi/multicall.json';
import Web3 from 'web3';
import { VaultEntity, VaultGov } from '../entities/vault';
import { ChainEntity } from '../entities/chain';
import BigNumber from 'bignumber.js';
import { AllValuesAsString } from '../utils/types-utils';
import { BoostEntity } from '../entities/boost';
import { isTokenBoost, isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';

// fix TS typings
const boostAbi = _boostAbi as AbiItem[];
const erc20Abi = _erc20Abi as AbiItem[];
const multicallAbi = _multicallAbi as AbiItem[];

export interface TokenBalance {
  tokenId: TokenEntity['id'];
  amount: BigNumber;
}

export interface GovVaultPoolBalance {
  vaultId: VaultEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}

export interface BoostBalance {
  boostId: BoostEntity['id'];
  balance: BigNumber;
  rewards: BigNumber;
}
/**
 * Get vault contract data
 */
export class BalanceAPI {
  constructor(protected web3: Web3, protected chain: ChainEntity) {}

  public async fetchTokenBalances(
    tokens: TokenEntity[],
    walletAddress: string
  ): Promise<TokenBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);

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
          tokenId: token.id,
          amount: tokenContract.methods.balanceOf(walletAddress),
        });
      } else {
        throw new Error(
          "BalanceAPI.fetchTokenBalanceByChain: I don't know how to fetch token balance"
        );
      }
    }
    const [results] = (await mc.all([calls])) as AllValuesAsString<TokenBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        tokenId: result.tokenId,
        amount: new BigNumber(result.amount),
      } as TokenBalance;
    });
  }

  public async fetchGovVaultPoolsBalance(
    vaults: VaultGov[],
    walletAddress: string
  ): Promise<GovVaultPoolBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const calls: ShapeWithLabel[] = [];

    for (const vault of vaults) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const poolContract = new this.web3.eth.Contract(boostAbi, vault.earnContractAddress);
      calls.push({
        vaultId: vault.id,
        balance: poolContract.methods.balanceOf(walletAddress),
        rewards: poolContract.methods.earned(walletAddress),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<GovVaultPoolBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        vaultId: result.vaultId,
        balance: new BigNumber(result.balance),
        rewards: new BigNumber(result.rewards),
      } as GovVaultPoolBalance;
    });
  }

  public async fetchBoostBalance(
    boosts: BoostEntity[],
    walletAddress: string
  ): Promise<BoostBalance[]> {
    const mc = new MultiCall(this.web3, this.chain.multicallAddress);
    const calls: ShapeWithLabel[] = [];

    for (const boost of boosts) {
      // we fetch a gov vault data with boostAbi, poker face *-*
      const earnContract = new this.web3.eth.Contract(boostAbi, boost.earnContractAddress);
      calls.push({
        boostId: boost.id,
        balance: earnContract.methods.balanceOf(walletAddress),
        rewards: earnContract.methods.earned(walletAddress),
      });
    }

    const [results] = (await mc.all([calls])) as AllValuesAsString<BoostBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        boostId: result.boostId,
        balance: new BigNumber(result.balance),
      } as BoostBalance;
    });
  }
}
