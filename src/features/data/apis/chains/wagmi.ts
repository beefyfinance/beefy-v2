import { createConfig, createStorage } from '@wagmi/core';
import { createClient, fallback, http } from 'viem';
import { viemChains } from './viem.ts';
import { getBatchOptionsForRpc } from '../viem/transports/transports.ts';
import type { injected } from '@wagmi/connectors';

/** this gives strict type checking on wagmi hooks e.g. useBlockNumber */
declare module '@wagmi/core' {
  interface Register {
    config: typeof wagmiConfig;
  }
}

/** wagmi config */
export const wagmiConfig = createConfig({
  multiInjectedProviderDiscovery: true,
  syncConnectedChain: true,
  ssr: false,
  chains: viemChains,
  connectors: [] as Array<ReturnType<typeof injected>>,
  storage: createStorage({ storage: window.localStorage }),
  client({ chain }) {
    const options = chain.beefy.transport;

    // TODO reuse rpcClientManager
    // @dev this returns a Client (not PublicClient/WalletClient) so you need to use action(client, opts) rather than client.action(opts)
    return createClient({
      chain,
      transport: fallback(
        chain.rpcUrls.default.http.map(url =>
          http(url, {
            timeout: options.timeout,
            retryDelay: options.retryDelay,
            retryCount: 0, // we retry in fallback after trying all rpcs
            batch: getBatchOptionsForRpc(url),
          })
        ),
        {
          retryCount: options.retryCount,
          retryDelay: options.retryDelay,
        }
      ),
      batch: {
        multicall: options.multicall,
      },
    });
    // return rpcClientManager.getBatchClient(chainId) as Client<Transport, (typeof viemChains)[number]>;
  },
});
