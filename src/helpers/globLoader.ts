/**
 * We can't do the import.meta.glob in a function as its statically rewritten at compile time to imports
 *
 * @param pathToUrl result of import.meta.glob<T>(path, { query: '?url',
import: 'default', eager: true })
 * @param pathToKey function to generate key from asset path, default is filename w/out extension
 */
export function createGlobLoader<T = string>(
  pathToUrl: Record<string, T>,
  pathToKey: (path: string) => string = filenameWithoutExt
): (keys: string | string[]) => T | undefined {
  const keyToPath = Object.fromEntries(Object.keys(pathToUrl).map(path => [pathToKey(path), path]));
  const cache: Record<string, T> = {};

  return function (keys: string | string[]): T | undefined {
    if (typeof keys === 'string') {
      keys = [keys];
    }

    for (const key of keys) {
      if (key in cache) {
        return cache[key];
      }

      if (key in keyToPath) {
        const asset = pathToUrl[keyToPath[key]];
        return (cache[key] = asset);
      }
    }
  };
}

export function removeExtension(filename: string) {
  return filename.substring(0, filename.lastIndexOf('.'));
}

export function basename(path: string) {
  const slash = path.lastIndexOf('/');
  return slash === -1 ? path : path.substring(slash + 1);
}

function filenameWithoutExt(path: string) {
  return removeExtension(basename(path));
}
