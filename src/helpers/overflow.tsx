import { useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';

export function useIsOverflowingHorizontally<T extends HTMLElement>() {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const { width, ref } = useResizeDetector<T>();

  useEffect(() => {
    if (!ref.current) return;

    setIsOverflowing(ref.current.scrollWidth > ref.current.offsetWidth);
  }, [width, ref, setIsOverflowing]);

  return { isOverflowing, ref };
}
