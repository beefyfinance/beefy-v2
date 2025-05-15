import type {
  FetchParams,
  FetchParamsOptions,
  GetUrlSearchParamsRecord,
  GetUrlSearchParamsScalarsEntry,
  GetUrlSearchParamsValuesEntry,
  URLSearchParamsInit,
} from './types.ts';
import { typedDefaultsDeep } from '../object.ts';

export const ABORT_REASON_TIMEOUT = '__timeout';

const DEFAULT_NULL_STRING = 'null';
const DEFAULT_UNDEFINED_STRING = 'undefined';
const DEFAULT_FETCH_PARAMS_OPTIONS: FetchParamsOptions = {
  keepNull: false,
  keepUndefined: false,
};

export function getUrlSearchParams(
  params: GetUrlSearchParamsRecord,
  options?: FetchParamsOptions
): URLSearchParams {
  return new URLSearchParams(
    valuesToString(
      flattenArrayValues(Object.entries(params)),
      typedDefaultsDeep(options, DEFAULT_FETCH_PARAMS_OPTIONS)
    )
  );
}

function flattenArrayValues(
  entries: Array<GetUrlSearchParamsValuesEntry>
): Array<GetUrlSearchParamsScalarsEntry> {
  return entries.flatMap(
    ([k, v]): Array<GetUrlSearchParamsScalarsEntry> =>
      Array.isArray(v) ? v.map(i => [k, i]) : [[k, v]]
  );
}

function valuesToString(
  entries: Array<GetUrlSearchParamsValuesEntry>,
  options: FetchParamsOptions
): Array<[string, string]> {
  const { keepNull, keepUndefined } = options;

  if (keepNull === undefined || keepNull === false) {
    entries = entries.filter(([, v]) => v !== null);
  }
  if (keepUndefined === undefined || keepUndefined === false) {
    entries = entries.filter(([, v]) => v !== undefined);
  }

  const nullString = typeof keepNull === 'string' ? keepNull : DEFAULT_NULL_STRING;
  const undefinedString =
    typeof keepUndefined === 'string' ? keepUndefined : DEFAULT_UNDEFINED_STRING;

  return entries.map(([k, v]) => [
    k,
    v === null ? nullString
    : v === undefined ? undefinedString
    : v.toString(),
  ]);
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
