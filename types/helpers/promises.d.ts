export declare function isFulfilledResult<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T>;
export declare function isRejectedResult<T>(result: PromiseSettledResult<T>): result is PromiseRejectedResult;
/**
 * Like [Promise.all] except it returns all fulfilled results even if some promises reject.
 */
export declare function allFulfilled<T>(promises: Promise<T>[]): Promise<T[]>;
export declare function asyncMap<T, U>(array: T[], mapper: (item: T) => Promise<U>): Promise<U[]>;
/** throws after {ms} milliseconds */
export declare function timeout(ms: number, errorMessage?: string | (() => Error)): Promise<void>;
