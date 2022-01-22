import { MultiCall } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import { isTokenBoost, isTokenErc20, isTokenNative, TokenEntity } from '../entities/token';

import _erc20Abi from '../../../config/abi/erc20.json';
import _multicallAbi from '../../../config/abi/multicall.json';
import Web3 from 'web3';
import { ChainEntity } from '../entities/chain';
import { AllValuesAsString } from '../utils/types-utils';
import BigNumber from 'bignumber.js';

// fix TS typings
const erc20Abi = _erc20Abi as AbiItem[];
const multicallAbi = _multicallAbi as AbiItem[];

interface TokenBalance {
  tokenId: TokenEntity['id'];
  amount: BigNumber;
}

export class TokenBalanceAPI {
  constructor(protected rpc: Web3) {}

  // maybe we want to re-render more often, we could make
  // this a generator instead
  public async fetchTokenBalanceByChain(
    chain: ChainEntity,
    tokens: TokenEntity[],
    walletAddress: string
  ): Promise<TokenBalance[]> {
    const mc = new MultiCall(this.rpc, chain.multicallAddress);

    const calls = tokens.map(token => {
      // skip virtual boost tokens
      if (isTokenBoost(token)) {
        console.info(`BalanceAPI.fetchTokenBalanceByChain: Skipping boost token ${token.id}`);
        return;
      }

      if (isTokenNative(token)) {
        const tokenContract = new this.rpc.eth.Contract(multicallAbi, mc.contract);
        return {
          tokenId: token.id,
          amount: tokenContract.methods.getEthBalance(walletAddress),
        };
      } else if (isTokenErc20(token)) {
        const tokenContract = new this.rpc.eth.Contract(erc20Abi, token.contractAddress);
        return {
          tokenId: token.id,
          amount: tokenContract.methods.balanceOf(walletAddress),
        };
      } else {
        throw new Error(
          "BalanceAPI.fetchTokenBalanceByChain: I don't know how to fetch token balance"
        );
      }
    });

    const [results] = (await mc.all([calls])) as AllValuesAsString<TokenBalance>[][];

    // format strings as numbers
    return results.map(result => {
      return {
        tokenId: result.tokenId,
        amount: new BigNumber(result.amount),
      } as TokenBalance;
    });
  }
}
