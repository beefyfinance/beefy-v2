import { useCallback, useEffect, useMemo, useState } from 'react';
import { miniSerializeError } from '@reduxjs/toolkit';
import { useMountedState } from './useMountedState.ts';
import { timeout } from '../helpers/promises.ts';

export type UseCopyToClipboardOptions = {
  /** set result back to idle after this many ms */
  clearResultAfter?: number | null;
  /** mark copy as failed after this many ms */
  timeoutAfter?: number;
};

export type UseCopyToClipboardReturn = {
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | undefined;
  copy: (text: string) => void;
  reset: () => void;
};

export function useCopyToClipboard({
  clearResultAfter = 5000,
  timeoutAfter = 5000,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardReturn {
  const isMounted = useMountedState();
  const [status, setStatus] = useState<UseCopyToClipboardReturn['status']>('idle');
  const [error, setError] = useState<UseCopyToClipboardReturn['error']>(undefined);
  const reset = useCallback(() => {
    setStatus('idle');
    setError(undefined);
  }, [setStatus, setError]);

  const copy = useCallback(
    (text: string) => {
      setStatus('pending');
      Promise.race([
        navigator.clipboard.writeText(text),
        timeout(timeoutAfter, 'Copy to clipboard timed out'),
      ])
        .then(() => {
          if (isMounted()) {
            setStatus(oldStatus => (oldStatus === 'pending' ? 'success' : oldStatus));
          } else {
            console.debug('Component unmounted before clipboard write succeeded');
          }
        })
        .catch(e => {
          if (isMounted()) {
            setError(miniSerializeError(e).message);
            setStatus(oldStatus => (oldStatus === 'pending' ? 'error' : oldStatus));
          } else {
            console.debug('Component unmounted before clipboard write failed', e);
          }
        });
    },
    [setStatus, setError, isMounted, timeoutAfter]
  );

  useEffect(() => {
    if (clearResultAfter !== null && (status === 'success' || status === 'error')) {
      const timer = setTimeout(() => {
        reset();
      }, clearResultAfter);
      return () => clearTimeout(timer);
    }
  }, [status, reset, clearResultAfter]);

  return useMemo(() => ({ status, error, copy, reset }), [status, error, copy, reset]);
}
