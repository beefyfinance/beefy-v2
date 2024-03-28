export function valueOrThrow<T>(
  value: T | undefined | null,
  message: string = 'selector: value is not set'
): T {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
  return value;
}
