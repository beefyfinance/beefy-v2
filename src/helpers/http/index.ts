import type {
  FetchCommonJsonRequest,
  FetchGetJsonRequest,
  FetchPostJsonRequest,
  FetchRequestInit,
} from './types';
import {
  ABORT_REASON_TIMEOUT,
  getCacheBuster,
  getTimeoutAbortSignal,
  getUrlSearchParams,
  isURLSearchParamsInit,
} from './helpers';
import {
  FetchAbortError,
  FetchError,
  FetchResponseError,
  FetchResponseJsonParseError,
  FetchResponseNotJsonError,
  FetchTimeoutError,
} from './errors';

export async function getJson<TResponse>(request: FetchGetJsonRequest): Promise<TResponse> {
  const { url, init } = getRequestUrlInit(request);
  return fetchJson<TResponse>(url, { ...init, method: 'GET' });
}

export async function postJson<TResponse>(request: FetchPostJsonRequest): Promise<TResponse> {
  const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
  const { url, init } = getRequestUrlInit(request);

  if (!init.headers.has('Content-Type')) {
    init.headers.set('Content-Type', 'application/json');
  }

  return fetchJson<TResponse>(url, { ...init, method: 'POST', body });
}

function getRequestUrlInit(request: FetchCommonJsonRequest): {
  url: string;
  init: FetchRequestInit;
} {
  const signal: AbortSignal | undefined =
    'signal' in request && request.signal
      ? request.signal
      : 'timeout' in request && request.timeout
      ? getTimeoutAbortSignal(request.timeout)
      : undefined;

  const headers = request.headers ? new Headers(request.headers) : new Headers();
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, */*;q=0.8');
  }

  const params = request.params
    ? isURLSearchParamsInit(request.params)
      ? new URLSearchParams(request.params)
      : getUrlSearchParams(request.params)
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
    },
  };
}

async function fetchJson<TResponse>(url: string, init: FetchRequestInit): Promise<TResponse> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err: unknown) {
    if (err && err instanceof Error) {
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

  if (res.ok) {
    if (res.headers.get('Content-Type')?.includes('application/json')) {
      try {
        return (await res.json()) as TResponse;
      } catch (err: unknown) {
        if (err && err instanceof Error) {
          if (err.name === 'SyntaxError') {
            throw new FetchResponseJsonParseError(res, err);
          } else {
            throw new FetchResponseError(res, err.message, err);
          }
        }
        throw err;
      }
    }
    throw new FetchResponseNotJsonError(res);
  }

  throw new FetchResponseError(res);
}
