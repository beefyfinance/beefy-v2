import { type Transport, type TransportConfig } from 'viem';
type OnResponseFn = (args: {
    method: string;
    params: unknown[];
    transport: ReturnType<Transport>;
} & ({
    error?: undefined;
    response: unknown;
    status: 'success';
} | {
    error: Error;
    response?: undefined;
    status: 'error';
})) => void;
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
export type CustomFallbackTransport = Transport<'custom-fallback', {
    onResponse: (fn: OnResponseFn) => void;
    transports: ReturnType<Transport>[];
}>;
export declare function customFallback(transports: Transport[], config?: FallbackTransportConfig): CustomFallbackTransport;
export {};
