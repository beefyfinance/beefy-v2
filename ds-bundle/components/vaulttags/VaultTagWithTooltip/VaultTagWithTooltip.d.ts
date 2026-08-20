import * as React from 'react';

/**
 * VaultTagWithTooltip — from beefy-v2@0.1.0.
 */
export interface VaultTagWithTooltipProps {
  css?: CssStyles;
  icon?: React.ReactNode;
  text: React.ReactNode;
  order?: "icon-text" | "text-icon";
  variant?: "light" | "dark";
  disabled?: boolean;
  size?: "normal" | "compact";
  onClick?: MouseEventHandler<HTMLDivElement>;
  tooltip: React.ReactNode;
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

export declare const VaultTagWithTooltip: React.ComponentType<VaultTagWithTooltipProps>;
