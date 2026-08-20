import * as React from 'react';

/**
 * Section — from beefy-v2@0.1.0.
 */
export interface SectionProps {
  title?: string;
  subTitle?: string;
  children: React.ReactNode;
  maxWidth?: HTMLStyledProps<any>;
  noPadding?: HTMLStyledProps<any>;
}

export declare const Section: React.ComponentType<SectionProps>;
