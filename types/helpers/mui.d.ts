import type { SystemStyleObject } from '@repo/styles/types';
type StylesRecord = Record<string, SystemStyleObject>;
/**
 * Simply passes the result of css.raw() to css() to generate the className
 * @deprecated Use css() directly instead (or recipes etc.)
 */
export declare function legacyMakeStyles<T extends StylesRecord>(stylesRecord: T): () => Record<keyof T, string>;
export {};
