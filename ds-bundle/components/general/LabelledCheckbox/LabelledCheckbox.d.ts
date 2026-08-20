import * as React from 'react';

/**
 * LabelledCheckbox — from beefy-v2@0.1.0.
 */
export interface LabelledCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  containerCss?: CssStyles;
  iconCss?: CssStyles;
  labelCss?: CssStyles;
  checkedIconCss?: CssStyles;
  checkVariant?: "circle" | "square";
  endAdornment?: React.ReactNode;
}

export declare const LabelledCheckbox: React.ComponentType<LabelledCheckboxProps>;
