import { type RefObject, useEffect } from 'react';

export type UseVerticalScrollShadowsProps = {
  scrollContainerRef: RefObject<HTMLElement>;
  topShadowRef?: RefObject<HTMLElement>;
  bottomShadowRef?: RefObject<HTMLElement>;
  visibleThreshold?: number;
  visibleThresholdUnits?: 'pixels' | 'percent';
};

export function useVerticalScrollShadows({
  scrollContainerRef,
  topShadowRef,
  bottomShadowRef,
  visibleThreshold = 10,
  visibleThresholdUnits = 'percent',
}: UseVerticalScrollShadowsProps) {
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const topShadow = topShadowRef?.current;
    const bottomShadow = bottomShadowRef?.current;

    if (!scrollContainer || (!topShadow && !bottomShadow)) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;
      const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
      const visibleRatio =
        visibleThresholdUnits === 'percent' ?
          visibleThreshold / 100
        : visibleThreshold / clientHeight;
      if (topShadow) {
        const opacity =
          maxScroll > 0 ? 1 - Math.max(0, visibleRatio - scrollRatio) / visibleRatio : 0;
        topShadow.style.opacity = opacity.toString();
      }
      if (bottomShadow) {
        const opacity =
          maxScroll > 0 ? 1 - Math.max(0, scrollRatio + visibleRatio - 1) / visibleRatio : 0;
        bottomShadow.style.opacity = opacity.toString();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [scrollContainerRef, topShadowRef, bottomShadowRef, visibleThreshold, visibleThresholdUnits]);
}
