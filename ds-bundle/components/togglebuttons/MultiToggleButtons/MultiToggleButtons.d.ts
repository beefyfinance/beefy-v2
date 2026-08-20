import * as React from 'react';

/**
 * MultiToggleButtons — from beefy-v2@0.1.0.
 */
export interface MultiToggleButtonsProps<TValue extends string = string> {
  value: TValue[];
  onChange: (value: TValue[]) => void;
  ButtonComponent?: FC<MultiToggleButtonProps<TValue>>;
}

export declare const MultiToggleButtons: React.ComponentType<MultiToggleButtonsProps>;
