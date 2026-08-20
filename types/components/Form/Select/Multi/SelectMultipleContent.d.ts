import type { CommonProps, SelectItem, SearchFunction } from '../types';
interface SelectMultipleContentProps<TItem extends SelectItem = SelectItem> extends CommonProps<TItem> {
    options: TItem[];
    selected: TItem['value'][];
    activeIndex: number | null;
    allSelected: boolean;
    noneSelected: boolean;
    getItemProps: (index: number) => Record<string, unknown>;
    setListRefs: ((el: HTMLButtonElement | null) => void)[];
    searchEnabled?: boolean;
    searchFunction?: SearchFunction<TItem>;
    placeholder?: string;
    autoFocus?: boolean;
}
export declare const SelectMultipleContent: (<TItem extends SelectItem = SelectItem>({ options, selected, activeIndex, allSelected, noneSelected, getItemProps, setListRefs, searchEnabled, searchFunction, OptionComponent, OptionButtonComponent, OptionLabelComponent, OptionStartAdornmentComponent, OptionBadgeComponent, OptionEndAdornmentComponent, placeholder, autoFocus, }: SelectMultipleContentProps<TItem>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
