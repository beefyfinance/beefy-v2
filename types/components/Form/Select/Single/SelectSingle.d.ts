import type { SelectItem, SelectSingleProps } from '../types';
export declare const SelectSingle: (<TItem extends SelectItem = SelectItem>({ selected, options, onChange, labelPrefix, unselectedLabel, SelectedComponent, SelectedButtonComponent, SelectedLabelComponent, SelectedLabelPrefixComponent, OptionComponent, OptionButtonComponent, OptionLabelComponent, OptionStartAdornmentComponent, OptionEndAdornmentComponent, OptionBadgeComponent, placement, layer, ...variantProps }: SelectSingleProps<TItem>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
