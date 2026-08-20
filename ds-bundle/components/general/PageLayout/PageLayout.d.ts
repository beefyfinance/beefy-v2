import * as React from 'react';

/**
 * PageLayout — from beefy-v2@0.1.0.
 */
export interface PageLayoutProps {
  content: React.ReactNode;
  header?: React.ReactNode;
  contentAlignedCenter?: boolean;
}

export declare const PageLayout: React.ComponentType<PageLayoutProps>;
