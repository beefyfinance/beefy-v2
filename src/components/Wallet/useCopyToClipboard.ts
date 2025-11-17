import { useCallback, useEffect, useMemo, useState } from 'react';
import { miniSerializeError } from '@reduxjs/toolkit';

export function useCopyToClipboard(clearStatusAfter: number | null = 5000) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | undefined>(undefined);
  const reset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
  }, [setStatus, setError]);
  const copy = useCallback(
    (text: string) => {
      setStatus('pending');
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setStatus(oldStatus => (oldStatus === 'pending' ? 'success' : oldStatus));
        })
        .catch(e => {
          setError(miniSerializeError(e).message);
          setStatus(oldStatus => (oldStatus === 'pending' ? 'error' : oldStatus));
        });
    },
    [setStatus, setError]
  );
  useEffect(() => {
    if (clearStatusAfter !== null && (status === 'success' || status === 'error')) {
      const timer = setTimeout(() => {
        reset();
      }, clearStatusAfter);
      return () => clearTimeout(timer);
    }
  }, [status, reset, clearStatusAfter]);
  return useMemo(() => ({ status, error, copy, reset }), [status, error, copy, reset]);
}
