import * as React from 'react';

/**
 * VaultValueStat — from beefy-v2@0.1.0.
 */
export interface VaultValueStatProps {
  /** label to show on mobile (when there are no colum headers) */
  label: string;
  /** Controls label visibility: - `false` — don't render the label - `true` — keep it visible at all breakpoints - a breakpoi */
  showLabel?: boolean | "sm" | "md" | "lg";
  /** tooltip content to show for entire stat */
  tooltip?: React.ReactNode;
  /** value for line one */
  value: React.ReactNode;
  /** value for line 2 */
  subValue?: React.ReactNode;
  /** hide the sub value line entirely */
  hideSubValue?: boolean;
  /** set to true to show loading indicator for the sub value slot also */
  expectSubValue?: boolean;
  /** blur the values */
  blur?: boolean;
  /** show loading indicator instead of values */
  loading?: boolean;
  /** when true, the main value and icon will get the boost color */
  boosted?: boolean;
  /** icon to show before the main value */
  Icon?: FC<SVGProps<SVGSVGElement>>;
  /** additional class name for outer div */
  className?: string;
  layout: StyledVariantProps<any>;
  align: StyledVariantProps<any>;
  altLayout: StyledVariantProps<any>;
  altAlign: StyledVariantProps<any>;
  altFrom: StyledVariantProps<any>;
  textWrap: StyledVariantProps<any>;
}

export declare const VaultValueStat: React.ComponentType<VaultValueStatProps>;
