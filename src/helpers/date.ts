export function datesAreEqual(a: Date | null, b: Date | null): boolean {
  // both are the same Date object, or both are null
  if (a === b) {
    return true;
  }

  // one is null, the other is not
  if (a === null || b === null) {
    return false;
  }

  return a.getTime() === b.getTime();
}
