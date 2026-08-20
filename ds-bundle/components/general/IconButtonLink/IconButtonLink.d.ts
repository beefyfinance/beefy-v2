import * as React from 'react';

/**
 * IconButtonLink — from beefy-v2@0.1.0.
 */
export interface IconButtonLinkProps {
  href: string;
  text: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string; }>;
  css?: CssStyles;
  textCss?: CssStyles;
  iconCss?: CssStyles;
}

export declare const IconButtonLink: React.ComponentType<IconButtonLinkProps>;
