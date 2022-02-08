import { isArray, isPlainObject, mapValues } from 'lodash';

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
