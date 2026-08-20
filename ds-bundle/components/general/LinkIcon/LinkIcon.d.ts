import * as React from 'react';

/**
 * LinkIcon — from beefy-v2@0.1.0.
 */
export interface LinkIconProps {
  logo: string | FC<SVGProps<SVGSVGElement>>;
  alt: string;
  href: string;
}

export declare const LinkIcon: React.ComponentType<LinkIconProps>;
