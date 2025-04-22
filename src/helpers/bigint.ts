export function bigintRange(start: bigint, end?: bigint): bigint[] {
  if (end === undefined) {
    end = start;
    start = BigInt(0);
  }

  return Array.from({ length: Number(end - start) }, (_, i) => start + BigInt(i));
}
