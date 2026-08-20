import * as React from 'react';

/**
 * Banner — from beefy-v2@0.1.0.
 */
export interface BannerProps {
  icon?: React.ReactNode;
  text: React.ReactNode;
  onClose?: () => void;
  variant?: "info" | "warning" | "error";
}

export declare const Banner: React.ComponentType<BannerProps>;
