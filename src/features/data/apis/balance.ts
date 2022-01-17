import { MultiCall } from 'eth-multicall';
import { AbiItem } from 'web3-utils';
import {
  isBoostToken,
  isTokenErc20,
  isTokenNative,
  TokenEntity,
  TokenErc20,
} from '../entities/token';
import { ChainConfig } from './config';

import _erc20Abi from '../../../config/abi/erc20.json';
import _multicallAbi from '../../../config/abi/multicall.json';
import _boostAbi from '../../../config/abi/boost.json';
import Web3 from 'web3';
import { VaultEntity } from '../entities/vault';
import { BeefyState } from '../state';
import { tokenByIdSelector } from '../selectors/tokens';

// fix TS typings
const erc20Abi = _erc20Abi as AbiItem[];
const multicallAbi = _multicallAbi as AbiItem[];
const boostAbi = _boostAbi as AbiItem[];

interface NativeCurrencyBalance {
  amount: Promise<number>; // not sure about this
  token: TokenEntity['id'];
}
interface Erc20CurrencyBalance {
  amount: Promise<number>; // not sure about this
  token: TokenEntity['id'];
  contractAddress: TokenErc20['contractAddress'];
}

type BalanceResult = NativeCurrencyBalance | Erc20CurrencyBalance;

export class BalanceAPI {
  constructor(protected rpc: Web3) {}

  // maybe we want to re-render more often, we could make
  // this a generator instead
  public async fetchTokensBalance(
    state: BeefyState,
    chainConfig: ChainConfig,
    tokens: TokenEntity[],
    walletAddress: string
  ): Promise<BalanceResult[]> {
    const mc = new MultiCall(this.rpc, chainConfig.multicallAddress);
    const calls: BalanceResult[] = [];
    for (const token of tokens) {
      // skip virtual boost tokens
      if (isBoostToken(token)) {
        continue;
      }

      // token.symbol === chainConfig.walletSettings.nativeCurrency.symbol
      if (isTokenNative(token)) {
        const tokenContract = new this.rpc.eth.Contract(multicallAbi, mc.contract);
        calls.push({
          amount: tokenContract.methods.getEthBalance(walletAddress),
          token: token.symbol,
        });
      } else if (isTokenErc20(token)) {
        const tokenContract = new this.rpc.eth.Contract(erc20Abi, walletAddress);
        calls.push({
          amount: tokenContract.methods.balanceOf(walletAddress),
          token: token.symbol,
          contractAddress: token.contractAddress,
        });
        /*
        for (let spender in token.allowance) {
          calls[net].push({
            allowance: tokenContract.methods.allowance(address, spender),
            token: tokenSymbol,
            spender: spender,
          });
        }
        */
      }
    }
    // TODO: fix this
    // @ts-ignore
    return mc.all([calls]);
  }

  // TODO
  /*
  public async fetchVaultBalance(
    chainConfig: ChainConfig,
    vaults: VaultEntity[],
    walletAddress: string
  ): Promise<> {
    const mc = new MultiCall(this.rpc, chainConfig.multicallAddress);
    const calls: BalanceResult[] = [];
    for (const token of vaults) {
    }
  }*/
}
