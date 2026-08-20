import type { FetchParams, FetchParamsOptions, GetUrlSearchParamsRecord, URLSearchParamsInit } from './types';
export declare const ABORT_REASON_TIMEOUT = "__timeout";
export declare function getUrlSearchParams(params: GetUrlSearchParamsRecord, options?: FetchParamsOptions): URLSearchParams;
export declare function getTimeoutAbortSignal(timeout: number): AbortSignal;
export declare function isURLSearchParamsInit(params: FetchParams): params is URLSearchParamsInit;
/**
 * @param mode short: minutely / long: hourly
 */
export declare function getCacheBuster(mode?: 'short' | 'long'): string;
