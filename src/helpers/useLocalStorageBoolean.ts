import { useCallback, useState } from 'react';
import { storageGet, storageSet } from './storage.ts';

export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean
): [boolean, (value: boolean) => void] {
  const [value, setValue] = useState(() => {
    const storageValue = storageGet(key);
    return storageValue === null ? defaultValue : storageValue === 'true';
  });

  const wrappedSetValue = useCallback(
    (value: boolean) => {
      setValue(value);
      storageSet(key, value.toString());
    },
    [setValue, key]
  );

  return [value, wrappedSetValue];
}
