import { isDevelopment } from '../features/data/utils/feature-flags.ts';

export function isFulfilledResult<T>(
  result: PromiseSettledResult<T>
): result is PromiseFulfilledResult<T> {
  return result.status === 'fulfilled';
}

export function isRejectedResult<T>(
  result: PromiseSettledResult<T>
): result is PromiseRejectedResult {
  return result.status === 'rejected';
}

/**
 * Like [Promise.all] except it returns all fulfilled results even if some promises reject.
 */
export async function allFulfilled<T>(promises: Promise<T>[]): Promise<T[]> {
  const results = await Promise.allSettled(promises);
  const fulfilled = results.filter(isFulfilledResult);
  if (isDevelopment) {
    const failed = results.filter(isRejectedResult);
    if (failed.length > 0) {
      console.debug(
        `[allFulfilled] ${failed.length} promises rejected, ${fulfilled.length} fulfilled`
      );
      failed.forEach(failure => console.debug(failure.reason));
    }
  }
  return fulfilled.map(result => result.value);
}

export function asyncMap<T, U>(array: T[], mapper: (item: T) => Promise<U>): Promise<U[]> {
  return Promise.all(array.map(mapper));
}
