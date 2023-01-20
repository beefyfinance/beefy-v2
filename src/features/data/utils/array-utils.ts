import { isArray, isPlainObject, mapValues, sortBy } from 'lodash';
import { BIG_ZERO } from '../../../helpers/big-number';
import BigNumber from 'bignumber.js';
import { KeysOfType } from './types-utils';

// https://github.com/lodash/lodash/issues/1244#issuecomment-356676695
export const mapValuesDeep = (obj: any, fn: (val: any, key: string, obj: any) => any) =>
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
  arry: T[],
  key: KeysOfType<T, string | number>,
  N: number = 6 // by default get the first 6 results of the array
): BaseEntry[] {
  const sortedArray = sortBy(arry, [key]).reverse();

  if (sortedArray.length <= N) {
    return sortedArray;
  }

  const other: BaseEntry = sortedArray.slice(N - 1, sortedArray.length).reduce(
    (tot, cur) => {
      tot.value = tot.value.plus(cur.value);
      tot.percentage += cur.percentage;
      return tot;
    },
    { key: 'others', value: BIG_ZERO, percentage: 0 }
  );

  const top: BaseEntry[] = sortedArray.slice(0, N - 1);
  top.push(other);
  return top;
}

export function sortWith<T extends {}>(items: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...items].sort(compareFn);
}

export function itemAtPercentile<T>(sortedItems: T[], percentile: number): T {
  const index =
    percentile >= 1 ? sortedItems.length - 1 : Math.floor(sortedItems.length * percentile);
  return sortedItems[index];
}
