import { http } from 'viem';
import { customFallback, type CustomFallbackTransport } from './fallbackTransport';

export function makeCustomFallbackTransport(
  rpcUrls: string[],
  retries: number = 3
): CustomFallbackTransport {
  const transports = rpcUrls.map(url =>
    http(url, {
      timeout: 10000,
      retryCount: retries,
      retryDelay: 350,
      batch: {
        batchSize: 10,
      },
    })
  );

  return customFallback(transports, {
    retryCount: retries,
  });
}
