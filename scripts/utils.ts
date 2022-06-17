import { getAddress } from '@ethersproject/address';

const trimReg = /(^\s*)|(\s*$)/g;

export function isValidChecksumAddress(address) {
  try {
    return address === getAddress(address);
  } catch {}

  return false;
}

export function maybeChecksumAddress(address) {
  try {
    return getAddress(address);
  } catch {}

  return false;
}

export function isEmpty(key) {
  if (key === undefined || key === '' || key === null) {
    return true;
  }
  if (typeof key === 'string') {
    key = key.replace(trimReg, '');
    return key === '' || key === null || key === 'null' || key === undefined || key === 'undefined';
  } else if (typeof key === 'undefined') {
    return true;
  } else if (typeof key == 'object') {
    for (let i in key) {
      return false;
    }
    return true;
  } else if (typeof key == 'boolean') {
    return false;
  }
}

export function objectInsert<TValue>(
  insertKey: string,
  insertValue: TValue,
  obj: Record<string, TValue>,
  relativeKey: string,
  relativePosition: 'before' | 'after' = 'after'
): Record<string, TValue> {
  if (!(relativeKey in obj)) {
    throw new Error(`${relativeKey} does not exist on object`);
  }

  return Object.fromEntries(
    Object.entries(obj).reduce((newEntries, pair) => {
      if (pair[0] === relativeKey && relativePosition === 'before')
        newEntries.push([insertKey, insertValue]);
      newEntries.push(pair);
      if (pair[0] === relativeKey && relativePosition === 'after')
        newEntries.push([insertKey, insertValue]);

      return newEntries;
    }, [])
  );
}
