import { createTransport, type Transport, type TransportConfig } from 'viem';

// not exported from viem
type OnResponseFn = (
  args: {
    method: string;
    params: unknown[];
    transport: ReturnType<Transport>;
  } & (
    | {
        error?: undefined;
        response: unknown;
        status: 'success';
      }
    | {
        error: Error;
        response?: undefined;
        status: 'error';
      }
  )
) => void;

type RankOptions = {
  /**
   * The polling interval (in ms) at which the ranker should ping the RPC URL.
   * @default client.pollingInterval
   */
  interval?: number;
  /**
   * The number of previous samples to perform ranking on.
   * @default 10
   */
  sampleCount?: number;
  /**
   * Timeout when sampling transports.
   * @default 1_000
   */
  timeout?: number;
  /**
   * Weights to apply to the scores. Weight values are proportional.
   */
  weights?: {
    /**
     * The weight to apply to the latency score.
     * @default 0.3
     */
    latency?: number;
    /**
     * The weight to apply to the stability score.
     * @default 0.7
     */
    stability?: number;
  };
};

export type FallbackTransportConfig = {
  /** The key of the Fallback transport. */
  key?: TransportConfig['key'];
  /** The name of the Fallback transport. */
  name?: TransportConfig['name'];
  /** Toggle to enable ranking, or rank options. */
  rank?: boolean | RankOptions;
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'];
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'];
};

export type CustomFallbackTransport = Transport<
  'custom-fallback',
  {
    onResponse: (fn: OnResponseFn) => void;
    transports: ReturnType<Transport>[];
  }
>;

export function customFallback(
  transports: Transport[],
  config: FallbackTransportConfig = {}
): CustomFallbackTransport {
  const { key = 'fallback', name = 'Fallback', retryCount, retryDelay } = config;
  return ({ chain, timeout }) => {
    let onResponse: OnResponseFn = () => {};

    return createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fetch = async (i = 0): Promise<any> => {
            const transport = transports[i]({ chain, retryCount: 0, timeout });
            try {
              const response = await transport.request({
                method,
                params,
              });

              onResponse({
                method,
                params: params as unknown[],
                response,
                transport,
                status: 'success',
              });

              return response;
            } catch (err) {
              onResponse({
                error: err as Error,
                method,
                params: params as unknown[],
                transport,
                status: 'error',
              });

              // If the error is deterministic, we don't need to fall back.
              // So throw the error.
              // if (isDeterministicError(err as Error)) throw err

              // If we've reached the end of the fallbacks, throw the error.
              if (i === transports.length - 1) throw err;

              // Otherwise, try the next fallback.
              return fetch(i + 1);
            }
          };
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return fetch();
        },
        retryCount,
        retryDelay,
        type: 'custom-fallback',
      },
      {
        onResponse: (fn: OnResponseFn) => (onResponse = fn),
        transports: transports.map(fn => fn({ chain, retryCount: 0 })),
      }
    );
  };
}
