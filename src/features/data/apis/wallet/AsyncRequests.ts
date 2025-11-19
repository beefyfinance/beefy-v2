import AsyncLock from 'async-lock';
import { WalletDuplicateRequestAbortedError } from './errors.ts';

type AbortablePromise<T> = Promise<T> & {
  requestId: number;
  abort: (reason: Error) => void;
  aborted: () => boolean;
};

export class AsyncRequests {
  protected lock = new AsyncLock();
  protected requestCounter = 0;
  protected requestsByKey: Map<string, AbortablePromise<unknown>> = new Map();

  create<T>(
    key: string,
    requestFn: () => Promise<T>,
    onAbortFn?: (reason: Error) => Promise<void>
  ): AbortablePromise<T> {
    // if an existing request for the same key exists, abort it first
    this.abortByKey(key, new WalletDuplicateRequestAbortedError());

    // create a new abortable request
    return this.lock.acquire(key, () => {
      const controller = new AbortController();
      const requestId = ++this.requestCounter;
      let abortHandler: (() => void) | undefined;

      // called to abort the request
      const abortRequest = (reason: Error) => {
        console.debug(`Aborting request ${key} (#${requestId}):`, reason);

        // shouldn't happen
        if (controller.signal.aborted) {
          console.warn(`Request ${key} (#${requestId}) is already aborted.`);
          return;
        }

        // mark signal as aborted
        controller.abort(reason);
      };

      // handle an aborted request
      const rejectOnAbort = new Promise<T>((_, reject) => {
        abortHandler = () => {
          const reason = controller.signal.reason as Error;
          // reject the promise
          reject(reason);
          // call optional onAbortFn
          onAbortFn?.(reason).catch(err => {
            console.error(`Error in onAbortFn for request ${key} (#${requestId}):`, err);
          });
        };
        controller.signal.addEventListener('abort', abortHandler);
      });

      // handle cleanup after request is done (resolved, rejected, or aborted)
      const cleanupRequest = () => {
        // if cleanup hasn't been done yet
        if (abortHandler) {
          // remove request
          this.requestsByKey.delete(key);
          // stop listening for aborts
          controller.signal.removeEventListener('abort', abortHandler);
          abortHandler = undefined;
        }
      };

      // first to settle between the actual request and the abort
      const promise = Promise.race([rejectOnAbort, requestFn()]).finally(cleanupRequest);

      // attach abort functionality to the promise
      const abortablePromise: AbortablePromise<T> = Object.assign(promise, {
        requestId,
        abort: abortRequest,
        aborted: () => controller.signal.aborted,
      });
      this.requestsByKey.set(key, abortablePromise);

      // return the abortable promise to user to await or abort
      return abortablePromise;
    }) as AbortablePromise<T>;
  }

  abortByKey(key: string, reason: Error): void {
    this.requestsByKey.get(key)?.abort(reason);
    this.requestsByKey.delete(key);
  }

  abortAll(reason: Error): void {
    for (const promise of this.requestsByKey.values()) {
      promise.abort(reason);
    }
    this.requestsByKey.clear();
  }
}
