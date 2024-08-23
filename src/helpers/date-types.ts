// this isn't enforced unless exactOptionalPropertyTypes is enabled
export type DurationSingle = {
  [K in keyof Required<Duration>]: { [KK in K]: NonNullable<Duration[K]> };
}[keyof Duration];
