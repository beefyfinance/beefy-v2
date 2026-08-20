import type { SelectItem, SelectMultiProps } from '../types';
export declare const SelectMultiple: (<TItem extends SelectItem<string> = SelectItem<string>>({ selected, options, onChange, labelPrefix, unselectedLabel, SelectedComponent, SelectedButtonComponent, SelectedLabelComponent, SelectedLabelPrefixComponent, OptionComponent, OptionButtonComponent, OptionLabelComponent, OptionStartAdornmentComponent, OptionEndAdornmentComponent, OptionBadgeComponent, placement, layer, searchEnabled, searchFunction, placeholder, allSelectedLabel, ...variantProps }: SelectMultiProps<TItem>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
