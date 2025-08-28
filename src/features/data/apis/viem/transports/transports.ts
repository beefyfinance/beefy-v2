import { http } from 'viem';
import { customFallback, type CustomFallbackTransport } from './fallbackTransport.ts';
import { createCachedFactory } from '../../../utils/factory-utils.ts';

const domainToBatchSize: Record<string, number> = {
  '1rpc.io': 1,
};

const getBatchSizeForRpc = createCachedFactory(
  (rpcUrl: string): number => {
    const url = new URL(rpcUrl);
    const domain = url.hostname;
    let maybeBatchSize: number | undefined = domainToBatchSize[domain];
    if (maybeBatchSize) {
      return maybeBatchSize;
    }

    const rootDomain = domain.split('.').slice(-2).join('.');
    maybeBatchSize = domainToBatchSize[rootDomain];
    if (maybeBatchSize) {
      return maybeBatchSize;
    }

    return 3;
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
      batch: {
        batchSize: getBatchSizeForRpc(url),
      },
    })
  );

  return customFallback(transports, {
    retryCount: retries,
    retryDelay: 350,
  });
}
