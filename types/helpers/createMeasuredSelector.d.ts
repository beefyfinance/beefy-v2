/**
 * Will create user timings with under 'name' in the timings chart of DevTools performance tool
 *
 * Usage:
 * Globally:
 * const measuredSelectOriginalSelector = createMeasuredSelector('selectOriginalSelector', selectOriginalSelector);
 * In component:
 * const result = useAppSelector(measuredSelectOriginalSelector);
 */
export declare function createMeasuredSelector<A extends unknown[], R>(name: string, selector: (...args: A) => R): (...args: A) => R;
