import { isArray, isPlainObject, mapValues, orderBy } from 'lodash-es';
import { BIG_ZERO } from '../../../helpers/big-number';
import type BigNumber from 'bignumber.js';
import type { KeysOfType } from './types-utils';

// https://github.com/lodash/lodash/issues/1244#issuecomment-356676695
export const mapValuesDeep = (
  obj: unknown[] | object,
  fn: (val: unknown, key: string | number, obj: unknown) => unknown
) =>
  isArray(obj)
    ? obj.map(item => mapValuesDeep(item, fn))
    : mapValues(obj, (val, key) =>
        isPlainObject(val) || isArray(val) ? mapValuesDeep(val, fn) : fn(val, key, obj)
      );

export function createIdMap<T extends { id: string }>(
  arr: T[],
  getId: (item: T) => string = item => item.id
) {
  return arr.reduce((agg, item) => {
    agg[getId(item)] = item;
    return agg;
  }, {} as { [id: string]: T });
}

//https://github.com/lodash/lodash/issues/2339#issuecomment-585615971
export const intersperse = <T>(arr: T[], separator: (n: number) => T): T[] =>
  arr.reduce<T[]>((acc, currentElement, currentIndex) => {
    const isLast = currentIndex === arr.length - 1;
    return [...acc, currentElement, ...(isLast ? [] : [separator(currentIndex)])];
  }, []);

export type BaseEntry = {
  key: string;
  value: BigNumber;
  percentage: number;
};

export function getTopNArray<T extends BaseEntry>(
  entries: T[],
  key: KeysOfType<T, string | number>,
  topCount: number,
  othersBase: T
): T[] {
  const sortedEntries = orderBy(entries, [key], ['desc']);
  if (sortedEntries.length <= topCount) {
    return sortedEntries;
  }

  const other: T = sortedEntries.slice(topCount - 1, sortedEntries.length).reduce(
    (tot, cur) => {
      tot.value = tot.value.plus(cur.value);
      tot.percentage += cur.percentage;
      return tot;
    },
    { ...othersBase, value: BIG_ZERO, percentage: 0 }
  );

  const top: T[] = sortedEntries.slice(0, topCount - 1);
  top.push(other);
  return top;
}

export function sortWith<T>(items: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...items].sort(compareFn);
}

export function itemAtPercentile<T>(sortedItems: T[], percentile: number): T {
  const index =
    percentile >= 1 ? sortedItems.length - 1 : Math.floor(sortedItems.length * percentile);
  return sortedItems[index];
}

export type NonEmptyArray<T> = [T, ...T[]];

export function isNonEmptyArray<T>(arr: T[] | undefined | null): arr is NonEmptyArray<T> {
  return !!arr && Array.isArray(arr) && arr.length > 0;
}

/** Pass to Array.filter to remove null/undefined and narrow type */
export function isDefined<T>(value: T): value is Exclude<T, undefined | null> {
  return !!value;
}
