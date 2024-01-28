import { createWriteStream } from 'node:fs';
import { access, constants, readFile, writeFile } from 'node:fs/promises';
import * as prettier from 'prettier';

export async function fileAccess(path: string, mode: number): Promise<boolean> {
  try {
    await access(path, mode);
    return true;
  } catch {
    return false;
  }
}

export async function fileExists(path: string): Promise<boolean> {
  return fileAccess(path, constants.F_OK);
}

export async function fileReadable(path: string): Promise<boolean> {
  return fileAccess(path, constants.F_OK | constants.R_OK);
}

export async function fileWritable(path: string): Promise<boolean> {
  return fileAccess(path, constants.F_OK | constants.R_OK | constants.W_OK);
}

export async function saveString(path: string, data: string) {
  return writeFile(path, data, 'utf-8');
}

async function formatJson<DataType = any>(
  path: string,
  json: DataType,
  pretty: boolean | 'prettier' = false
): Promise<string> {
  switch (pretty) {
    case 'prettier':
      const config = await prettier.resolveConfig(path);
      return prettier.format(JSON.stringify(json, null, 2), { ...config, filepath: path });
    case true:
      return JSON.stringify(json, null, 2);
    default:
      return JSON.stringify(json);
  }
}

export async function saveJson<DataType = any>(
  path: string,
  json: DataType,
  pretty: boolean | 'prettier' = false
) {
  return saveString(path, await formatJson(path, json, pretty));
}

export async function loadString(path: string): Promise<string> {
  return await readFile(path, 'utf-8');
}

export async function loadJson<ReturnType = any>(path: string): Promise<ReturnType> {
  const json = await readFile(path, 'utf-8');
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
