import { http } from 'viem';
import { customFallback, type CustomFallbackTransport } from './fallbackTransport.ts';
import { createCachedFactory } from '../../../utils/factory-utils.ts';

type BatchOptions = boolean | { batchSize: number; wait: number };

const DEFAULT_BATCH_OPTIONS: BatchOptions = { batchSize: 3, wait: 0 };
const domainToBatchOptions: Record<string, BatchOptions> = {
  '1rpc.io': false,
};

export const getBatchOptionsForRpc = createCachedFactory(
  (rpcUrl: string): BatchOptions => {
    const url = new URL(rpcUrl);
    const domain = url.hostname;
    let maybeBatchOptions: BatchOptions | undefined = domainToBatchOptions[domain];
    if (maybeBatchOptions) {
      return maybeBatchOptions;
    }

    const rootDomain = domain.split('.').slice(-2).join('.');
    maybeBatchOptions = domainToBatchOptions[rootDomain];
    if (maybeBatchOptions) {
      return maybeBatchOptions;
    }

    return DEFAULT_BATCH_OPTIONS;
  },
  url => url
);

export function makeCustomFallbackTransport(
  rpcUrls: string[],
  retries: number = 3
): CustomFallbackTransport {
  const transports = rpcUrls.map(url =>
    http(url, {
      timeout: 10000,
      retryCount: rpcUrls.length > 1 ? 0 : retries,
      retryDelay: 350,
      batch: getBatchOptionsForRpc(url),
    })
  );

  return customFallback(transports, {
    retryCount: retries,
    retryDelay: 350,
  });
}
