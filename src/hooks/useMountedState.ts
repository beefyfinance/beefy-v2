import { useCallback, useEffect, useRef } from 'react';

export function useMountedState(): () => boolean {
  const ref = useRef<boolean>(false);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  // refs are not reactive, so we return a function
  return useCallback(() => ref.current, []);
}
