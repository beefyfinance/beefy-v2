import { ChainConfig, getChain } from '../../common/config';
import { createPublicClient, fallback, http } from 'viem';
import type { Chain } from 'viem/chains';
import { createCachedFactory } from './factory';

function buildViemChain(chain: ChainConfig): Chain {
  return {
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: {
      decimals: 18,
      name: chain.walletSettings.nativeCurrency.name,
      symbol: chain.walletSettings.nativeCurrency.symbol,
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

export const getRpcClient = createCachedFactory(
  (chainId: string) => {
    const chain = getChain(chainId);
    return createPublicClient({
      batch: {
        multicall: {
          batchSize: 128,
          wait: 200,
        },
      },
      chain: buildViemChain(chain),
      transport: fallback(
        chain.rpc.map(url =>
          http(url, {
            batch: false,
          })
        )
      ),
    });
  },
  (chainId: string) => chainId
);
