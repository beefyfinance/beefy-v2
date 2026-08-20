import * as React from 'react';

/**
 * Scrollable — from beefy-v2@0.1.0.
 */
export interface ScrollableProps {
  children: React.ReactNode;
  autoHeight?: number | boolean;
  css?: CssStyles;
  shadowCss?: CssStyles;
  topShadowCss?: CssStyles;
  bottomShadowCss?: CssStyles;
  leftShadowCss?: CssStyles;
  rightShadowCss?: CssStyles;
  thumbCss?: CssStyles;
  hideShadows?: boolean;
  scrollContainer?: boolean;
}

export declare const Scrollable: React.ComponentType<ScrollableProps>;
