import * as React from 'react';

/**
 * Toggle — from beefy-v2@0.1.0.
 */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  css?: CssStyles;
}

export declare const Toggle: React.ComponentType<ToggleProps>;
