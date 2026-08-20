import * as React from 'react';

/**
 * MultiToggleButton — from beefy-v2@0.1.0.
 */
export interface MultiToggleButtonProps<TValue extends string = string> {
  onClick: (isSelected: boolean, value: TValue) => void;
}

export declare const MultiToggleButton: React.ComponentType<MultiToggleButtonProps>;
