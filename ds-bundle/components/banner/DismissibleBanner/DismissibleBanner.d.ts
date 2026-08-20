import * as React from 'react';

/**
 * DismissibleBanner — from beefy-v2@0.1.0.
 */
export interface DismissibleBannerProps {
  icon?: React.ReactNode;
  text: React.ReactNode;
  onClose?: () => void;
  variant?: "info" | "warning" | "error";
  id: string;
}

export declare const DismissibleBanner: React.ComponentType<DismissibleBannerProps>;
