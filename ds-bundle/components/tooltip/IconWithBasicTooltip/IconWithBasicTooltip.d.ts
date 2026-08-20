import * as React from 'react';

/**
 * IconWithBasicTooltip — from beefy-v2@0.1.0.
 */
export interface IconWithBasicTooltipProps {
  title: string;
  content?: React.ReactNode;
  variant?: "light" | "dark";
  disabled?: boolean;
  size?: "normal" | "compact";
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
  layer?: 0 | 1 | 2;
  arrowWidth?: number;
  arrowHeight?: number;
}

export declare const IconWithBasicTooltip: React.ComponentType<IconWithBasicTooltipProps>;
