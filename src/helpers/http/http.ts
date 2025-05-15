import type {
  FetchCommonJsonRequest,
  FetchGetJsonRequest,
  FetchPostJsonRequest,
  FetchRequestInit,
  HttpHelper,
} from './types.ts';
import {
  ABORT_REASON_TIMEOUT,
  getCacheBuster,
  getTimeoutAbortSignal,
  getUrlSearchParams,
  isURLSearchParamsInit,
} from './helpers.ts';
import {
  FetchAbortError,
  FetchError,
  FetchResponseBodyTextError,
  FetchResponseDecodeError,
  FetchResponseError,
  FetchResponseJsonParseError,
  FetchResponseNotJsonError,
  FetchTimeoutError,
  isFetchError,
} from './errors.ts';
import { isError } from '../error.ts';
import PQueue from 'p-queue';

/** response decoded as JSON */
export async function getJson<TResponse>(request: FetchGetJsonRequest): Promise<TResponse> {
  const { url, init } = getRequestUrlInit(request);

  if (!init.headers.has('Accept')) {
    init.headers.set('Accept', 'application/json, */*;q=0.8');
  }

  return fetchResponseBody<TResponse>(url, { ...init, method: 'GET' }, decodeJson);
}

/** body sent as JSON, response decoded as JSON */
export async function postJson<TResponse>(request: FetchPostJsonRequest): Promise<TResponse> {
  const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
  const { url, init } = getRequestUrlInit(request);

  if (!init.headers.has('Accept')) {
    init.headers.set('Accept', 'application/json, */*;q=0.8');
  }
  if (!init.headers.has('Content-Type')) {
    init.headers.set('Content-Type', 'application/json');
  }

  return fetchResponseBody<TResponse>(url, { ...init, method: 'POST', body }, decodeJson);
}

/** response decoded as text */
export async function getText(request: FetchGetJsonRequest): Promise<string> {
  const { url, init } = getRequestUrlInit(request);

  if (!init.headers.has('Accept')) {
    init.headers.set('Accept', '*/*');
  }

  return fetchResponseBody<string>(url, { ...init, method: 'GET' }, decodeText);
}

/** body sent as JSON, response decoded as text */
export async function postText(request: FetchPostJsonRequest): Promise<string> {
  const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
  const { url, init } = getRequestUrlInit(request);

  if (!init.headers.has('Accept')) {
    init.headers.set('Accept', '*/*');
  }

  if (!init.headers.has('Content-Type')) {
    init.headers.set('Content-Type', 'application/json');
  }

  return fetchResponseBody<string>(url, { ...init, method: 'POST', body }, decodeText);
}

export function makeHttpHelper(baseUrl: string): HttpHelper {
  return {
    getJson<TResponse>(
      path: string,
      request: Omit<FetchGetJsonRequest, 'url'> = {}
    ): Promise<TResponse> {
      return getJson({
        ...request,
        url: `${baseUrl}${path}`,
      });
    },
    postJson<TResponse>(
      path: string,
      request: Omit<FetchPostJsonRequest, 'url'>
    ): Promise<TResponse> {
      return postJson({
        ...request,
        url: `${baseUrl}${path}`,
      });
    },
    getText(path: string, request: Omit<FetchGetJsonRequest, 'url'> = {}): Promise<string> {
      return getText({
        ...request,
        url: `${baseUrl}${path}`,
      });
    },
    postText(path: string, request: Omit<FetchPostJsonRequest, 'url'>): Promise<string> {
      return postText({
        ...request,
        url: `${baseUrl}${path}`,
      });
    },
  };
}

function wrapWithQueue<T extends (...args: never[]) => Promise<unknown>>(queue: PQueue, fn: T): T {
  return ((...args: Parameters<T>) => queue.add(() => fn(...args), { throwOnTimeout: true })) as T;
}

export function makeRateLimitedHttpHelper(
  baseUrl: string,
  requestsPerSecond: number,
  concurrentRequests: number = 1
): HttpHelper {
  const queue = new PQueue({
    intervalCap: requestsPerSecond >= 1 ? requestsPerSecond : 1,
    interval: requestsPerSecond >= 1 ? 1000 : 1000 / requestsPerSecond,
    concurrency: concurrentRequests,
    carryoverConcurrencyCount: true,
    autoStart: true,
  });

  const helper = makeHttpHelper(baseUrl);
  helper.getJson = wrapWithQueue(queue, helper.getJson.bind(helper));
  helper.postJson = wrapWithQueue(queue, helper.postJson.bind(helper));
  helper.getText = wrapWithQueue(queue, helper.getText.bind(helper));
  helper.postText = wrapWithQueue(queue, helper.postText.bind(helper));
  return helper;
}

function getRequestUrlInit(request: FetchCommonJsonRequest): {
  url: string;
  init: FetchRequestInit;
} {
  const signal: AbortSignal | undefined =
    'signal' in request && request.signal ? request.signal
    : 'timeout' in request && request.timeout ? getTimeoutAbortSignal(request.timeout)
    : undefined;

  const headers = request.headers ? new Headers(request.headers) : new Headers();

  const params =
    request.params ?
      isURLSearchParamsInit(request.params) ? new URLSearchParams(request.params)
      : getUrlSearchParams(request.params, request.paramsOptions)
    : new URLSearchParams();
  if (request.cacheBuster) {
    params.set('_', getCacheBuster(request.cacheBuster));
  }

  const url = `${request.url}${params.size ? `?${params}` : ''}`;
  return {
    url,
    init: {
      headers,
      signal,
      ...(request.init || {}),
    },
  };
}

async function decodeJson<TResponse>(res: Response): Promise<TResponse> {
  if (!res.headers.get('Content-Type')?.includes('application/json')) {
    throw new FetchResponseNotJsonError(res);
  }

  try {
    return (await res.json()) as TResponse;
  } catch (err: unknown) {
    if (isError(err) && !isFetchError(err)) {
      if (err.name === 'SyntaxError') {
        throw new FetchResponseJsonParseError(res, err);
      } else {
        throw new FetchResponseError(res, err.message, err);
      }
    }
    throw err;
  }
}

async function decodeText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch (err: unknown) {
    if (isError(err) && !isFetchError(err)) {
      throw new FetchResponseBodyTextError(res, err);
    }
    throw err;
  }
}

async function fetchResponseBody<T>(
  url: string,
  init: FetchRequestInit,
  decoder: (res: Response) => Promise<T>
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err: unknown) {
    if (isError(err)) {
      if (err.name === 'TimeoutError') {
        throw new FetchTimeoutError(err);
      } else if (err.name === 'AbortError') {
        if (init.signal?.aborted && init.signal.reason === ABORT_REASON_TIMEOUT) {
          throw new FetchTimeoutError(err);
        }
        throw new FetchAbortError(err);
      } else {
        throw new FetchError(err.message, err);
      }
    }
    throw err;
  }

  if (!res.ok) {
    throw new FetchResponseError(res);
  }

  try {
    return await decoder(res);
  } catch (err: unknown) {
    if (isError(err) && !isFetchError(err)) {
      throw new FetchResponseDecodeError(res, err);
    }
    throw err;
  }
}
