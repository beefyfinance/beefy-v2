import { useCallback, useEffect, useRef } from 'react';

export function useClickAway<T extends HTMLElement>(callback: () => void) {
  const clickAwayRef = useRef<T | null>(null);
  const tooltipRef = useRef<T | null>(null);

  const handleClickAway = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (clickAwayRef.current && !clickAwayRef.current.contains(target)) {
        if (tooltipRef.current && tooltipRef.current.contains(target)) {
          return;
        }
        callback();
      }
    },
    [clickAwayRef, tooltipRef, callback]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickAway);
    return () => {
      document.removeEventListener('mousedown', handleClickAway);
    };
  }, [handleClickAway]);

  return { clickAwayRef, tooltipRef };
}
