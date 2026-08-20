import * as React from 'react';

/**
 * IconWithTooltip — from beefy-v2@0.1.0.
 */
export interface IconWithTooltipProps {
  Icon?: FC<SVGProps<SVGSVGElement>>;
  iconCss?: CssStyles;
  iconSize?: number;
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
  tooltip: React.ReactNode;
}

export declare const IconWithTooltip: React.ComponentType<IconWithTooltipProps>;
