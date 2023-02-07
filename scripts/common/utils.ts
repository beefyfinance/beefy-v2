import { getAddress } from '@ethersproject/address';
import { createWriteStream, promises as fsPromises } from 'fs';

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

export async function saveJson<DataType = any>(
  path: string,
  json: DataType,
  pretty: boolean = false
) {
  return fsPromises.writeFile(path, JSON.stringify(json, null, pretty ? 2 : undefined));
}

export async function loadJson<ReturnType = any>(path: string): Promise<ReturnType> {
  const json = await fsPromises.readFile(path, 'utf-8');
  return JSON.parse(json);
}

function escapeCsvValue(input: string) {
  const stringValue = typeof input === 'object' ? JSON.stringify(input) : String(input);
  const escaped = stringValue.replace(/"/g, '""').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  return `"${escaped}"`;
}

export async function saveCsv<T extends Record<string, any>>(
  path: string,
  data: T[],
  withHeader: boolean = true,
  columns?: (keyof T)[]
) {
  if (!columns || columns.length === 0) {
    if (data.length === 0) {
      throw new Error('No columns or data');
    }
    columns = Object.keys(data[0]);
  }

  const stream = createWriteStream(path);
  if (withHeader) {
    stream.write(columns.map(escapeCsvValue).join(',') + '\n');
  }
  for (const row of data) {
    stream.write(columns.map(column => escapeCsvValue(row[column])).join(',') + '\n');
  }
  stream.end();
}

export function splitMax(input: string, delim: string, max: number): string[] {
  if (max < 2) {
    throw new Error('max must be greater than 1');
  }

  const parts = input.split(delim);
  if (parts.length <= max) {
    return parts;
  }
  return [...parts.slice(0, max - 1), parts.slice(max - 1).join(delim)];
}

export function sortKeys<T>(
  obj: Record<string, T>,
  sortFn: (a: string, b: string) => number
): Record<string, T> {
  return Object.fromEntries(Object.entries(obj).sort((a, b) => sortFn(a[0], b[0])));
}
