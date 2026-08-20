import * as React from 'react';

/**
 * BaseInput — from beefy-v2@0.1.0.
 */
export interface BaseInputProps {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: boolean;
  warning?: boolean;
  success?: boolean;
  inputRef?: React.Ref;
}

export declare const BaseInput: React.ComponentType<BaseInputProps>;
