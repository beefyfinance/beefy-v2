import type { UseFloatingOptions } from '@floating-ui/react';
import type { ButtonHTMLAttributes, FC, HTMLAttributes, SVGProps } from 'react';
import type { FCWithRef, HtmlProps, Override } from '../../../features/data/utils/types-utils.ts';
import type { ButtonVariantProps } from '../../Button/styles.ts';

export type SelectItem<TValue extends string = string> = {
  value: TValue;
  label: string;
  badge?: string;
};

export type CommonProps<TItem extends SelectItem = SelectItem> = Override<
  ButtonVariantProps,
  {
    className?: string;
    labelPrefix?: string;
    unselectedLabel?: string;
    options: TItem[];
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
    placement?: UseFloatingOptions['placement'];
    /** z-index layer */
    layer?: 0 | 1 | 2;
    /** enable search */
    searchEnabled?: boolean;
    /** search function */
    searchFunction?: SearchFunction<TItem>;
    /** placeholder */
    placeholder?: string;
  }
>;

type SingleOnlyProps<TItem extends SelectItem = SelectItem> = {
  selected: TItem['value'];
  onChange: (value: TItem['value']) => void;
  /** pass a new one of these for logic */
  SelectedComponent?: FCWithRef<SelectedSingleProps<TItem>, HTMLButtonElement>;
};

type MultiOnlyProps<TItem extends SelectItem = SelectItem> = {
  selected: Array<TItem['value']>;
  onChange: (value: Array<TItem['value']>) => void;
  /** pass a new one of these for logic */
  SelectedComponent?: FCWithRef<SelectedMultiProps<TItem>, HTMLButtonElement>;
  searchEnabled?: boolean;
  allSelectedLabel?: string;
};

export type SelectSingleProps<TItem extends SelectItem = SelectItem> = CommonProps<TItem> &
  SingleOnlyProps<TItem>;

export type SelectMultiProps<TItem extends SelectItem = SelectItem> = CommonProps<TItem> &
  MultiOnlyProps<TItem>;

export type ButtonProps = HtmlProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
export type SpanProps = HtmlProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
export type SvgProps = SVGProps<SVGSVGElement>;
export type DivProps = HtmlProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type OptionProps<TItem extends SelectItem = SelectItem> = {
  item: TItem;
  index: number;
  active: boolean;
  selected: boolean;
  allSelected: boolean;
  noneSelected: boolean;
  getProps: (index: number) => ButtonProps;
  ButtonComponent: FCWithRef<OptionButtonProps, HTMLButtonElement>;
  LabelComponent: FC<OptionLabelProps>;
  BadgeComponent?: FC<OptionBadgeProps>;
  StartAdornmentComponent?: FC<OptionIconProps<TItem>>;
  EndAdornmentComponent?: FC<OptionIconProps<TItem>>;
};

export type OptionButtonProps = Override<
  ButtonProps,
  {
    active: boolean;
    selected: boolean;
  }
>;

export type OptionLabelProps = Override<
  SpanProps,
  {
    selected: boolean;
  }
>;

export type OptionIconProps<TItem extends SelectItem = SelectItem> = {
  item: TItem;
  selected: boolean;
  allSelected: boolean;
  noneSelected: boolean;
};

export type OptionBadgeProps = Override<
  SpanProps,
  {
    selected: boolean;
  }
>;

export type OptionEndAdornmentProps = Override<
  DivProps,
  {
    selected: boolean;
  }
>;

export type CommonSelectedButtonProps = Override<
  Override<ButtonProps, ButtonVariantProps>,
  {
    selected: boolean;
  }
>;

export type CommonSelectedLabelProps = Override<
  SpanProps,
  {
    selected: boolean;
  }
>;

export type CommonSelectedLabelPrefixProps = Override<
  SpanProps,
  {
    selected: boolean;
  }
>;

export type CommonSelectArrowProps = Override<
  SvgProps,
  {
    active?: boolean;
  }
>;

type CommonSelectedProps = Override<
  ButtonVariantProps,
  {
    labelPrefix?: string;
    unselectedLabel: string;
    active: boolean;
    getProps: (props?: ButtonProps) => ButtonProps;
    ButtonComponent: FCWithRef<CommonSelectedButtonProps, HTMLButtonElement>;
    LabelComponent: FC<CommonSelectedLabelProps>;
    LabelPrefixComponent: FC<CommonSelectedLabelPrefixProps>;
  }
>;

export type SelectedSingleProps<TItem extends SelectItem = SelectItem> = CommonSelectedProps & {
  /** null means not option selected, unselectedLabel should be rendered */
  item?: TItem;
};

export type SelectedMultiProps<TItem extends SelectItem = SelectItem> = CommonSelectedProps & {
  /** null means not option selected, unselectedLabel should be rendered */
  items?: TItem[];
  allSelected: boolean;
  allSelectedLabel?: string;
};

export type SearchFunction<TItem extends SelectItem = SelectItem> = (
  item: TItem,
  search: string
) => boolean;

export type SearchComponentProps<TItem extends SelectItem = SelectItem> = {
  value: TItem['value'];
  onChange: (value: TItem['value']) => void;
};
