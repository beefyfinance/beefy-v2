export type RequireAtLeastOne<TObj, TKeys extends keyof TObj = keyof TObj> = Pick<
  TObj,
  Exclude<keyof TObj, TKeys>
> &
  {
    [K in TKeys]-?: Required<Pick<TObj, K>> & Partial<Pick<TObj, Exclude<TKeys, K>>>;
  }[TKeys];

export type ExtractStartsWith<T extends string, U extends string> = T extends `${U}${infer R}`
  ? `${U}${R}`
  : never;

export type ExtractStartsRest<T extends string, U extends string> = T extends `${U}${infer R}`
  ? R
  : never;

export type OptionalRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
