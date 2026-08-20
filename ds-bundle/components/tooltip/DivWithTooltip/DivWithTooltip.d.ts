import * as React from 'react';

/**
 * DivWithTooltip — from beefy-v2@0.1.0.
 */
export interface DivWithTooltipProps {
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
  children: React.ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export declare const DivWithTooltip: React.ComponentType<DivWithTooltipProps>;
