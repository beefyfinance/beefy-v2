import { useCallback, useEffect, useState } from 'react';
import type { SerializedError } from '@reduxjs/toolkit';
import { miniSerializeError } from '@reduxjs/toolkit';

type AsyncStatus = 'idle' | 'pending' | 'success' | 'error';

type AsyncReturnType<T> = {
  execute: () => void;
  status: AsyncStatus;
  value: T | null;
  error: SerializedError | null;
};

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  initialValue: T | null = null,
  immediate: boolean = true
): AsyncReturnType<T> {
  const [status, setStatus] = useState<AsyncStatus>('idle');
  const [value, setValue] = useState<T | null>(initialValue);
  const [error, setError] = useState<SerializedError | null>(null);

  const execute = useCallback(() => {
    setStatus('pending');
    setError(null);
    asyncFunction()
      .then(response => {
        setValue(response);
        setStatus('success');
      })
      .catch(error => {
        setError(miniSerializeError(error));
        setStatus('error');
      });
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}
