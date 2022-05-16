import { useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';

export function useIsOverflowingHorizontally() {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const { width, ref } = useResizeDetector();

  useEffect(() => {
    if (!ref.current) return;

    console.log(
      ref.current.scrollWidth,
      ref.current.offsetWidth,
      ref.current.scrollWidth > ref.current.offsetWidth
    );
    setIsOverflowing(ref.current.scrollWidth > ref.current.offsetWidth);
  }, [width, ref, setIsOverflowing]);

  return { isOverflowing, ref };
}
