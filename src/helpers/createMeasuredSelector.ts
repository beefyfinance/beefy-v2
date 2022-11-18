const markSupported = !!(window && window.performance && window.performance.mark);

/**
 * Will create user timings with under 'name' in the timings chart of DevTools performance tool
 *
 * Usage:
 * Globally:
 * const measuredSelectOriginalSelector = createMeasuredSelector('selectOriginalSelector', selectOriginalSelector);
 * In component:
 * const result = useAppSelector(measuredSelectOriginalSelector);
 */
export function createMeasuredSelector<A extends unknown[], R>(
  name: string,
  selector: (...args: A) => R
) {
  if (!markSupported) {
    return selector;
  }

  const startMark = `${name}:start`;
  const endMark = `${name}:end`;
  return (...args: A): R => {
    performance.mark(startMark);
    const result = selector(...args);
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    return result;
  };
}
