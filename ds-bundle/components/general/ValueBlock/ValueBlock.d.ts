import * as React from 'react';

/**
 * ValueBlock — from beefy-v2@0.1.0.
 */
export interface ValueBlockProps {
  label: React.ReactNode;
  value: React.ReactNode;
  textContent?: boolean;
  tooltip?: React.ReactNode;
  usdValue?: React.ReactNode;
  loading?: boolean;
  blurred?: boolean;
  labelCss?: CssStyles;
  valueCss?: CssStyles;
  priceCss?: CssStyles;
}

export declare const ValueBlock: React.ComponentType<ValueBlockProps>;
