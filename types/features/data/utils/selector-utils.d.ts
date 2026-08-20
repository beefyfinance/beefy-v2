import type BigNumber from 'bignumber.js';
export declare function valueOrThrow<T>(value: T | undefined | null, message?: string): T;
/** For returning from selectors so a new object isn't created causing a re-render */
export declare const EMPTY_ARRAY: readonly never[];
export declare function arrayOrStaticEmpty<T>(arr: T[] | undefined | null): T[];
export declare function bigNumberOrStaticZero(value: BigNumber | undefined | null): BigNumber;
