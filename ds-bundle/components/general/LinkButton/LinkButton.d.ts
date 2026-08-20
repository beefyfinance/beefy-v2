import * as React from 'react';

/**
 * LinkButton — from beefy-v2@0.1.0.
 */
export interface LinkButtonProps {
  href?: string;
  text?: string;
  type?: string;
  css?: CssStyles;
  hideIconOnMobile?: boolean;
}

export declare const LinkButton: React.ComponentType<LinkButtonProps>;
