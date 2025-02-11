import { http } from 'viem';
import { customFallback, type CustomFallbackTransport } from './fallbackTransport';

export function makeCustomFallbackTransport(rpcUrls: string[]): CustomFallbackTransport {
  const transports = rpcUrls.map(url =>
    http(url, {
      timeout: 10000,
      retryCount: 5,
      retryDelay: 100,
      batch: {
        batchSize: 10,
      },
    })
  );

  return customFallback(transports);
}
