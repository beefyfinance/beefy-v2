export function indexOrNull<TValue extends string, TObj extends { value: TValue }>(
  array: TObj[],
  value: TValue | null
): number | null {
  if (value === null) {
    return null;
  }
  const index = array.findIndex(item => item.value === value);
  return index === -1 ? null : index;
}
