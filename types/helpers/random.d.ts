/**
 * Return a new array with `items` shuffled deterministically from `seed` (input left untouched).
 * Same seed + same items always produce the same order.
 */
export declare function seededShuffle<T>(items: T[], seed: number): T[];
