import { createPublicClient, http } from 'viem';
import { createCachedFactory } from '../../src/features/data/utils/factory-utils.ts';
import { type AppChainId, getChainRpc, getChain } from './config.ts';
import type { ChainConfig } from '../../src/features/data/apis/config-types.ts';

function createViemClient(chainId: AppChainId, chain: ChainConfig) {
  const rpcUrl = getChainRpc(chainId);
  return createPublicClient({
    batch: {
      multicall: {
        batchSize: 1028,
        wait: 100,
      },
    },
    chain: {
      id: chain.chainId,
      name: chain.name,
      nativeCurrency: {
        decimals: 18,
        name: chain.native.symbol,
        symbol: chain.native.symbol,
      },
      rpcUrls: {
        public: { http: [rpcUrl] },
        default: { http: [rpcUrl] },
      },
      blockExplorers: {
        default: { name: `${chain.name} Explorer`, url: chain.explorerUrl },
      },
      contracts: {
        multicall3: {
          address: chain.multicall3Address,
        },
      },
    },
    transport: http(rpcUrl, {
      retryCount: 5,
      retryDelay: 800,
    }),
  });
}

export const getViemClient = createCachedFactory(
  (chainId: AppChainId) => createViemClient(chainId, getChain(chainId)),
  (chainId: AppChainId) => chainId
);
