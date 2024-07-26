/**
 * Used to model an RPC call return type
 * where everything returned is a string
 */
export type AllValuesAsString<T> = AllValuesAs<T, string>;

export type AllValuesAs<T, U> = {
  [key in keyof T]: U;
};

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type SnakeToCamelCase<Key extends string> =
  Key extends `${infer FirstPart}_${infer FirstLetter}${infer LastPart}`
    ? `${FirstPart}${Uppercase<FirstLetter>}${SnakeToCamelCase<LastPart>}`
    : Key;

export type ChangeTypeOfKeys<T extends object, Keys extends keyof T, NewType> = {
  [K in keyof T]: K extends Keys ? NewType : T[K];
};

export type NullToUndefined<T> = T extends null ? Exclude<T | undefined, null> : T;

export type Rest<TPicked, TFull extends Record<keyof TPicked, unknown>> = TPicked &
  Omit<TFull, keyof TPicked>;

export type MapNullToUndefined<T extends object> = {
  [K in keyof T]: NullToUndefined<T[K]>;
};

type Web3KeepTypes = boolean;
type Web3ConvertType<T> = T extends Array<infer U>
  ? Web3ConvertType<U>[]
  : T extends Web3KeepTypes
  ? T
  : string;

export type AsWeb3Result<T extends object> = Prettify<{
  [key in keyof T]: Web3ConvertType<T[key]>;
}>;

export type KeysOfUnion<T> = T extends unknown ? keyof T : never;

export type EnsureKeys<
  TKey extends string,
  TObj extends {
    [key in TKey]: unknown;
  }
> = {
  [key in TKey]: TObj[key];
};

/** Return type of 1-level deep promise or never */
export type PromiseReturnType<T> = T extends PromiseLike<infer U> ? U : never;

/** Excludes keys whose value type is never */
export type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OptionalRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
