import * as React from 'react';

/**
 * SelectSingleContent — from beefy-v2@0.1.0.
 */
export interface SelectSingleContentProps<TItem extends SelectItem = SelectItem> {
  options: TItem[];
  selectedIndex: number;
  activeIndex: number;
  allSelected?: boolean;
  noneSelected: boolean;
  getItemProps: (index: number) => Record<string, unknown>;
  setListRefs: ((el: HTMLButtonElement | null) => void)[];
  disabledIndexes?: number[];
  className?: string;
  labelPrefix?: string;
  unselectedLabel?: string;
  /** pass a new one of these for logic */
  OptionComponent?: FCWithRef<OptionProps<TItem>, HTMLButtonElement>;
  /** can use styled() on this for css */
  OptionButtonComponent?: FCWithRef<OptionButtonProps, HTMLButtonElement>;
  /** can use styled() on this for css */
  OptionLabelComponent?: FC<OptionLabelProps>;
  /** optional */
  OptionStartAdornmentComponent?: FC<OptionIconProps<TItem>>;
  /** can use styled() on this for css */
  OptionEndAdornmentComponent?: FC<OptionIconProps<TItem>>;
  /** can use styled() on this for css */
  OptionBadgeComponent?: FC<OptionBadgeProps>;
  /** can use styled() on this for css */
  SelectedButtonComponent?: FCWithRef<CommonSelectedButtonProps, HTMLButtonElement>;
  /** can use styled() on this for css */
  SelectedLabelPrefixComponent?: FC<CommonSelectedLabelPrefixProps>;
  /** can use styled() on this for css */
  SelectedLabelComponent?: FC<CommonSelectedLabelProps>;
  /** dropdown position */
  placement?: "top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end";
  /** z-index layer */
  layer?: 0 | 1 | 2;
  /** enable search */
  searchEnabled?: boolean;
  /** search function */
  searchFunction?: SearchFunction<TItem>;
  /** placeholder */
  placeholder?: string;
}

export declare const SelectSingleContent: React.ComponentType<SelectSingleContentProps>;
