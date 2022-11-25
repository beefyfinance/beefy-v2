import { useCallback, useState } from 'react';

export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(() => {
    try {
      const storageValue = localStorage.getItem(key);
      return storageValue === null ? defaultValue : storageValue === 'true';
    } catch {
      return defaultValue;
    }
  });

  const wrappedSetValue = useCallback(
    (value: boolean) => {
      setValue(value);
      try {
        localStorage.setItem(key, value.toString());
      } catch (error) {
        // swallow error
      }
    },
    [setValue, key]
  );

  return [value, wrappedSetValue];
}
