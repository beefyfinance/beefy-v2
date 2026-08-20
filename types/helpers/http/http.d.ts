import type { FetchGetJsonRequest, FetchPostJsonRequest, HttpHelper } from './types';
/** response decoded as JSON */
export declare function getJson<TResponse>(request: FetchGetJsonRequest): Promise<TResponse>;
/** body sent as JSON, response decoded as JSON */
export declare function postJson<TResponse>(request: FetchPostJsonRequest): Promise<TResponse>;
/** response decoded as text */
export declare function getText(request: FetchGetJsonRequest): Promise<string>;
/** body sent as JSON, response decoded as text */
export declare function postText(request: FetchPostJsonRequest): Promise<string>;
export declare function makeHttpHelper(baseUrl: string): HttpHelper;
export declare function makeRateLimitedHttpHelper(baseUrl: string, requestsPerSecond: number, concurrentRequests?: number): HttpHelper;
