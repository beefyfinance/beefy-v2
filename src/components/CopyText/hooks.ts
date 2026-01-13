import { useEffect, useRef } from 'react';

export function useMountedState(): boolean {
  const ref = useRef<boolean>(false);
  useEffect(() => {
    ref.current = true;
    return () => {
      ref.current = false;
    };
  }, []);
  return ref.current;
}
