import type { HeadersInit } from 'undici-types/fetch';

export type URLSearchParamsInit =
  | Record<string, string>
  | [string, string][]
  | string
  | URLSearchParams;
export type FetchParams =
  | Record<string, string | number | boolean | string[]>
  | URLSearchParamsInit;
export type FetchHeaders = HeadersInit;

export type FetchAbortSignal = { signal?: AbortSignal } | { timeout?: number };

export type FetchCommonJsonRequest = {
  url: string;
  params?: FetchParams;
  headers?: FetchHeaders;
  cacheBuster?: 'short' | 'long';
} & FetchAbortSignal;

export type FetchGetJsonRequest = FetchCommonJsonRequest;

export type FetchPostJsonRequest = FetchCommonJsonRequest & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
};

export type FetchRequestInit = Omit<RequestInit, 'headers'> & {
  headers: Headers;
};

export type FetchGetFn = <TResponse>(request: FetchGetJsonRequest) => Promise<TResponse>;
export type FetchPostFn = <TResponse>(request: FetchPostJsonRequest) => Promise<TResponse>;

export type FetchJson = {
  get: FetchGetFn;
  post: FetchPostFn;
};
