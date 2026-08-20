import * as React from 'react';

/**
 * Alert — from beefy-v2@0.1.0.
 */
export interface AlertProps {
  IconComponent: FC<SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  variant: any;
  css?: CssStyles;
}

export declare const Alert: React.ComponentType<AlertProps>;
