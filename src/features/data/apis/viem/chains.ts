import type { Chain } from 'viem/chains';
import type { ChainEntity } from '../../entities/chain';

export function buildViemChain(chain: ChainEntity): Chain {
  return {
    id: chain.networkChainId,
    name: chain.name,
    nativeCurrency: {
      decimals: 18,
      name: chain.walletSettings.native,
      symbol: chain.walletSettings.native,
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
