export type GetUrlSearchParamsScalars = string | number | boolean | null | undefined;
export type GetUrlSearchParamsValues = GetUrlSearchParamsScalars | Array<GetUrlSearchParamsScalars>;
export type GetUrlSearchParamsRecord = Record<string, GetUrlSearchParamsValues>;
export type GetUrlSearchParamsValuesEntry = [string, GetUrlSearchParamsValues];
export type GetUrlSearchParamsScalarsEntry = [string, GetUrlSearchParamsScalars];

export type URLSearchParamsInit = Record<string, string> | string[][] | string | URLSearchParams;

export type FetchParams = GetUrlSearchParamsRecord | URLSearchParamsInit;

export type FetchParamsOptions = {
  // keep params with null values as "null" or custom string
  keepNull?: boolean | string;
  // keep params with undefined values as "undefined" or custom string
  keepUndefined?: boolean | string;
};

export type FetchHeaders = HeadersInit;

export type FetchAbortSignal =
  | {
      signal?: AbortSignal;
    }
  | {
      timeout?: number;
    };

export type FetchCommonJsonRequest = {
  url: string;
  params?: FetchParams;
  paramsOptions?: FetchParamsOptions;
  headers?: FetchHeaders;
  cacheBuster?: 'short' | 'long';
  init?: Omit<RequestInit, 'headers' | 'body' | 'signal' | 'method'>;
} & FetchAbortSignal;

export type FetchGetJsonRequest = FetchCommonJsonRequest;

export type FetchPostJsonRequest = FetchCommonJsonRequest & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
};

export type FetchRequestInit = Omit<RequestInit, 'headers'> & {
  headers: Headers; // make headers required
};

export type HttpHelper = {
  getJson<TResponse>(path: string, request?: Omit<FetchGetJsonRequest, 'url'>): Promise<TResponse>;
  postJson<TResponse>(
    path: string,
    request?: Omit<FetchPostJsonRequest, 'url'>
  ): Promise<TResponse>;
  getText(path: string, request: Omit<FetchGetJsonRequest, 'url'>): Promise<string>;
  postText(path: string, request: Omit<FetchPostJsonRequest, 'url'>): Promise<string>;
};
