import * as React from 'react';

/**
 * ReloadSpinner — from beefy-v2@0.1.0.
 */
export interface ReloadSpinnerProps {
  state?: boolean | "disabled";
  autoRefresh?: boolean;
  autoRefreshSeconds?: number;
  onClick?: () => void;
  css?: CssStyles;
}

export declare const ReloadSpinner: React.ComponentType<ReloadSpinnerProps>;
