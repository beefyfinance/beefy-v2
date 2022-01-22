/**
 * allows us to do
 *      await sleep(10 * 1000)
 *
 * Useful for polling data at regular interval with unknown network conditions
 */
export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(ms), ms);
  });
}

export type PollStop = () => void;

/**
 * Wait ms, then call fn, then wait ms, then call fn, then wait ms, etc
 *
 * The return value is a stop() function to stop looping
 */
export function poll(fn: () => Promise<any>, ms: number): PollStop {
  let stop = false;

  async function doPoll() {
    await sleep(ms);
    await fn();
    if (!stop) {
      // do a set timeout with no ms parameter to avoid infinite stack
      setTimeout(doPoll);
    }
  }
  doPoll();

  return () => {
    stop = true;
  };
}
