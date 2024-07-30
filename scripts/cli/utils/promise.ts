import { createCachedFactory } from './factory';

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

class AsyncLock {
  private resolveFn: () => void;
  private lockPromise: Promise<void>;

  constructor() {
    this.resolveFn = () => {};
    this.lockPromise = Promise.resolve();
  }

  private async lock() {
    await this.lockPromise;
    this.lockPromise = new Promise(resolve => (this.resolveFn = resolve));
  }

  private unlock() {
    this.resolveFn();
  }

  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    await this.lock();
    try {
      return await fn();
    } finally {
      this.unlock();
    }
  }
}

const createNamedLock = createCachedFactory(
  (name: string) => new AsyncLock(),
  name => name
);

export async function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return createNamedLock(name).acquire(fn);
}
