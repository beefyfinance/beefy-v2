/** @dev return type is only valid if collection contains all keys */
export function typedKeyBy<
  TKey extends string | number | symbol,
  TKeyValue extends string | number | symbol,
  TEntry extends { [K in TKey]: TKeyValue }
>(collection: TEntry[], key: TKey): Record<TKeyValue, TEntry> {
  return Object.fromEntries(collection.map(item => [item[key], item])) as Record<TKeyValue, TEntry>;
}

type TypedKeys<T> = Array<
  keyof {
    [K in keyof T as K extends string ? K : K extends number ? string : never]: T[K];
  }
>;

export function typedKeys<TEntry extends {}>(entry: TEntry): TypedKeys<TEntry> {
  return Object.keys(entry) as TypedKeys<TEntry>;
}
