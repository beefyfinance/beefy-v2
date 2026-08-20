import * as React from 'react';

/**
 * Marquee — from beefy-v2@0.1.0.
 */
export interface MarqueeProps {
  /** content to scroll (duplicated for a gap-less, seamless loop) */
  children: React.ReactNode;
  /** scroll speed in px/second — longer content takes proportionally longer */
  speed?: number;
  /** gap in px between the end of one copy and the start of the next (the loop seam). Lower it to keep items flowing tightly  */
  gap?: number;
  /** applied to the scrolling content element — use it to style `children` */
  className?: string;
}

export declare const Marquee: React.ComponentType<MarqueeProps>;
