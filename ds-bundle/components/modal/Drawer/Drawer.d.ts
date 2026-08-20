import * as React from 'react';

/**
 * Drawer — from beefy-v2@0.1.0.
 */
export interface DrawerProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  position?: any;
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
}

export declare const Drawer: React.ComponentType<DrawerProps>;
