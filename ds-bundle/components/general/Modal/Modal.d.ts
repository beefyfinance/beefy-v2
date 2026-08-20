import * as React from 'react';

/**
 * Modal — from beefy-v2@0.1.0.
 */
export interface ModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  layer?: 0 | 1 | 2;
  scrollable?: boolean;
  position?: any;
}

export declare const Modal: React.ComponentType<ModalProps>;
