/** localStorage can throw (private mode, disabled storage, quota) and is absent outside browsers */
export function storageGet(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** returns false when the value was not stored (storage absent, disabled or full) */
export function storageSet(key: string, value: string): boolean {
  try {
    const storage = globalThis.localStorage;
    if (!storage) {
      return false;
    }
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // not removing is fine
  }
}
