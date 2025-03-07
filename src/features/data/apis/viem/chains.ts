import type { Chain } from 'viem/chains';
import type { ChainEntity } from '../../entities/chain.ts';
import type { ChainConfig } from '../config-types.ts';

export function buildViemChain(chain: ChainEntity | ChainConfig): Chain {
  const id = 'networkChainId' in chain ? chain.networkChainId : chain.chainId;
  return {
    id: id,
    name: chain.name,
    nativeCurrency: {
      decimals: chain.native.decimals,
      name: chain.native.symbol,
      symbol: chain.native.symbol,
    },
    rpcUrls: {
      public: { http: chain.rpc },
      default: { http: chain.rpc },
    },
    blockExplorers: {
      default: { name: `${chain.name} Explorer`, url: chain.explorerUrl },
    },
    contracts: {
      multicall3: {
        address: chain.multicall3Address,
      },
    },
  };
}
