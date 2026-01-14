import { useMemo } from 'react';

const mobileRE =
  /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|redmi|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
const notMobileRE = /CrOS/;
const tabletRE = /android|ipad|playbook|silk/i;

export type IsMobileOptions = {
  /** don't return true for tablets */
  excludeTablets?: boolean;
  /** guess based on max touch points */
  featureDetect?: boolean;
};

/**
 * try to detect mobile devices (not screensize)
 * @dev not reactive to navigator changes
 **/
export function useIsMobile({
  excludeTablets = false,
  featureDetect = true,
}: IsMobileOptions = {}): boolean {
  return useMemo(() => {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return false;
    }

    const ua = navigator.userAgent || undefined;
    let isMobile = !!ua && mobileRE.test(ua) && !notMobileRE.test(ua);

    if (!isMobile && !excludeTablets) {
      isMobile = !!ua && tabletRE.test(ua);
    }

    if (!isMobile && featureDetect) {
      isMobile = (navigator.maxTouchPoints || 0) > 1;
    }

    return isMobile;
  }, [excludeTablets, featureDetect]);
}
