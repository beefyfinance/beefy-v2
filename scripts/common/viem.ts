import { createPublicClient, http } from 'viem';
import { createCachedFactory } from '../../src/features/data/utils/factory-utils';
import { AppChainId, ChainConfig, chainRpcs, getChain } from './config';

function createViemClient(chainId: AppChainId, chain: ChainConfig) {
  return createPublicClient({
    batch: {
      multicall: {
        batchSize: 512,
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
        public: { http: [chainRpcs[chainId]] },
        default: { http: [chainRpcs[chainId]] },
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
    transport: http(),
  });
}

export const getViemClient = createCachedFactory(
  (chainId: AppChainId) => createViemClient(chainId, getChain(chainId)),
  (chainId: AppChainId) => chainId
);
