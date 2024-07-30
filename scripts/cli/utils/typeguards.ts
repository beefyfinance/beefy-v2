export function isDefined<T>(value: T): value is Exclude<T, undefined | null> {
  return value !== undefined && value !== null;
}

export function isFieldDefined<K extends string, T extends { [KP in K]: any }>(field: K) {
  return (o: T): o is T & { [P in K]: Exclude<T[K], undefined | null> } => isDefined(o[field]);
}
