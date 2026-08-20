import * as React from 'react';

/**
 * Step — from beefy-v2@0.1.0.
 */
export interface StepProps {
  stepType: "bridge";
  title?: string;
  onBack?: () => void;
  children: React.ReactNode;
  titleAdornment?: React.ReactNode;
  contentCss?: CssStyles;
  noPadding?: boolean;
}

export declare const Step: React.ComponentType<StepProps>;
