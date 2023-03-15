/**
 * Used to model an RPC call return type
 * where everything returned is a string
 */
export type AllValuesAsString<T> = {
  [key in keyof T]: string;
};

export type KeysOfType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type SnakeToCamelCase<Key extends string> =
  Key extends `${infer FirstPart}_${infer FirstLetter}${infer LastPart}`
    ? `${FirstPart}${Uppercase<FirstLetter>}${SnakeToCamelCase<LastPart>}`
    : Key;

export type ChangeTypeOfKeys<T extends object, Keys extends keyof T, NewType> = {
  [K in keyof T]: K extends Keys ? NewType : T[K];
};
