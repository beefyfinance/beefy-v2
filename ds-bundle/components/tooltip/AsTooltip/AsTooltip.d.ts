import * as React from 'react';

/**
 * AsTooltip — from beefy-v2@0.1.0.
 */
export interface AsTooltipProps {
  placement?: "top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end";
  offset?: number;
  openOnClick?: boolean;
  openOnHover?: boolean;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  openOnFocus?: boolean;
  variant?: "light" | "dark";
  layer?: 0 | 1 | 2;
  size?: "normal" | "compact";
  arrowWidth?: number;
  arrowHeight?: number;
  disabled?: boolean;
  content: React.ReactNode;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
}

export declare const AsTooltip: React.ComponentType<AsTooltipProps>;
