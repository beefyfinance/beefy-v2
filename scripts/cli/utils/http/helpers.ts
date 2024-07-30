import type { FetchParams, URLSearchParamsInit } from './types';

export const ABORT_REASON_TIMEOUT = '__timeout';

export function getUrlSearchParams(
  params: Record<string, string | number | boolean | string[]>
): URLSearchParams {
  return new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      Array.isArray(v)
        ? v.map(i => [k, i.toString()] as [string, string])
        : [[k, v.toString()] as [string, string]]
    )
  );
}

export function getTimeoutAbortSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(ABORT_REASON_TIMEOUT), timeout);
  return controller.signal;
}

export function isURLSearchParamsInit(params: FetchParams): params is URLSearchParamsInit {
  return (
    !!params &&
    (typeof params === 'string' ||
      Array.isArray(params) ||
      (typeof params === 'object' && params instanceof URLSearchParams))
  );
}

/**
 * @param mode short: minutely / long: hourly
 */
export function getCacheBuster(mode: 'short' | 'long' = 'short'): string {
  const d = new Date();

  if (mode === 'long') {
    d.setMinutes(0, 0, 0);
  } else {
    d.setSeconds(0, 0);
  }

  return d.getTime().toString();
}
