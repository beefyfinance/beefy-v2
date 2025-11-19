import { createTransport, type Transport, type TransportConfig, shouldThrow } from 'viem';

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
  interval?: number | undefined;
  /**
   * Ping method to determine latency.
   */
  ping?: (parameters: { transport: ReturnType<Transport> }) => Promise<unknown> | undefined;
  /**
   * The number of previous samples to perform ranking on.
   * @default 10
   */
  sampleCount?: number | undefined;
  /**
   * Timeout when sampling transports.
   * @default 1_000
   */
  timeout?: number | undefined;
  /**
   * Weights to apply to the scores. Weight values are proportional.
   */
  weights?:
    | {
        /**
         * The weight to apply to the latency score.
         * @default 0.3
         */
        latency?: number | undefined;
        /**
         * The weight to apply to the stability score.
         * @default 0.7
         */
        stability?: number | undefined;
      }
    | undefined;
};

export type FallbackTransportConfig = {
  /** The key of the Fallback transport. */
  key?: TransportConfig['key'] | undefined;
  /** The name of the Fallback transport. */
  name?: TransportConfig['name'] | undefined;
  /** Toggle to enable ranking, or rank options. */
  rank?: boolean | RankOptions | undefined;
  /** The max number of times to retry. */
  retryCount?: TransportConfig['retryCount'] | undefined;
  /** The base delay (in ms) between retries. */
  retryDelay?: TransportConfig['retryDelay'] | undefined;
  /** Callback on whether an error should throw or try the next transport in the fallback. */
  shouldThrow?: (error: Error) => boolean | undefined;
};

export type CustomFallbackTransport<
  transports extends readonly Transport[] = readonly Transport[],
> = Transport<
  'custom-fallback',
  {
    onResponse: (fn: OnResponseFn) => void;
    transports: {
      [key in keyof transports]: ReturnType<transports[key]>;
    };
  }
>;

export function customFallback<const transports extends readonly Transport[]>(
  transports_: transports,
  config: FallbackTransportConfig = {}
): CustomFallbackTransport<transports> {
  const {
    key = 'custom-fallback',
    name = 'Fallback',
    // rank = false,
    shouldThrow: shouldThrow_ = shouldThrow,
    retryCount,
    retryDelay,
  } = config;

  return (({ chain, /*pollingInterval = 4_000,*/ timeout, ...rest }) => {
    const transports = transports_;
    let onResponse: OnResponseFn = () => {};

    return createTransport(
      {
        key,
        name,
        async request({ method, params }) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fetch = async (i = 0): Promise<any> => {
            const transport = transports[i]({
              ...rest,
              chain,
              retryCount: 0,
              timeout,
            });
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

              // e.g. user cancelled request
              if (shouldThrow_(err as Error)) throw err;

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
  }) as CustomFallbackTransport<transports>;
}
