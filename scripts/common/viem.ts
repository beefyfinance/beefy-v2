import { createPublicClient } from 'viem';
import { createCachedFactory } from '../../src/features/data/utils/factory-utils.ts';
import { type AppChainId, getChain, getChainRpc } from './config.ts';
import type { ChainConfig } from '../../src/features/data/apis/config-types.ts';
import { uniq } from 'lodash-es';
import { makeCustomFallbackTransport } from '../../src/features/data/apis/viem/transports/transports.ts';

function createViemClient(chainId: AppChainId, chain: ChainConfig) {
  const primaryRpcUrl = getChainRpc(chainId);
  const rpcUrls = uniq([primaryRpcUrl, ...chain.rpc]);

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
        public: { http: [primaryRpcUrl] },
        default: { http: [primaryRpcUrl] },
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
    transport: makeCustomFallbackTransport(rpcUrls, 5),
  });
}

export const getViemClient = createCachedFactory(
  (chainId: AppChainId) => createViemClient(chainId, getChain(chainId)),
  (chainId: AppChainId) => chainId
);
