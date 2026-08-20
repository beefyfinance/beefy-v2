/**
 * We can't do the import.meta.glob in a function as its statically rewritten at compile time to imports
 *
 * @param pathToUrl result of import.meta.glob<T>(path, { query: '?url',
import: 'default', eager: true })
 * @param pathToKey function to generate key from asset path, default is filename w/out extension
 */
export declare function createGlobLoader<T = string>(pathToUrl: Record<string, T>, pathToKey?: (path: string) => string): (keys: string | string[]) => T | undefined;
export declare function removeExtension(filename: string): string;
export declare function basename(path: string): string;
