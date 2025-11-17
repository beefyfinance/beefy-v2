import type { Chain } from 'viem/chains';
import type { ChainEntity } from '../chains/entity-types.ts';

export function buildViemChain(chain: ChainEntity): Chain {
  return {
    id: chain.networkChainId,
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
