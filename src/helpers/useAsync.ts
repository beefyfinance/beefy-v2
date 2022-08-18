import { useCallback, useEffect, useState } from 'react';
import { miniSerializeError, SerializedError } from '@reduxjs/toolkit';

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  initialValue: T = null,
  immediate: boolean = true
) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<SerializedError | null>(null);

  const execute = useCallback(() => {
    setStatus('pending');
    setError(null);
    return asyncFunction()
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
