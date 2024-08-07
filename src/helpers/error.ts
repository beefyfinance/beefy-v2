export function isError(err: unknown): err is Error {
  return !!err && err instanceof Error;
}
