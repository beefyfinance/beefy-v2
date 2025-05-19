import { http } from 'viem';
import { customFallback, type CustomFallbackTransport } from './fallbackTransport.ts';

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
        batchSize: 3, // TODO configure per provider
      },
    })
  );

  return customFallback(transports, {
    retryCount: retries,
  });
}
