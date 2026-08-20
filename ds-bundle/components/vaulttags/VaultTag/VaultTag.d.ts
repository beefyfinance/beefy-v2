import * as React from 'react';

/**
 * VaultTag — from beefy-v2@0.1.0.
 */
export interface VaultTagProps {
  css?: CssStyles;
  icon?: React.ReactNode;
  text: React.ReactNode;
  order?: "icon-text" | "text-icon";
}

export declare const VaultTag: React.ComponentType<VaultTagProps>;
