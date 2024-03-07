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

type Web3KeepTypes = boolean;
type Web3ConvertType<T> = T extends Array<infer U>
  ? Web3ConvertType<U>[]
  : T extends Web3KeepTypes
  ? T
  : string;

export type AsWeb3Result<T extends object> = Prettify<{
  [key in keyof T]: Web3ConvertType<T[key]>;
}>;
