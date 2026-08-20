import type { SelectItem, CommonProps } from '../types';
interface SelectSingleContentProps<TItem extends SelectItem = SelectItem> extends CommonProps<TItem> {
    options: TItem[];
    selectedIndex: number | null;
    activeIndex: number | null;
    allSelected?: boolean;
    noneSelected: boolean;
    getItemProps: (index: number) => Record<string, unknown>;
    setListRefs: ((el: HTMLButtonElement | null) => void)[];
    disabledIndexes?: number[];
}
export declare const SelectSingleContent: (<TItem extends SelectItem = SelectItem>({ options, selectedIndex, activeIndex, allSelected, noneSelected, getItemProps, setListRefs, disabledIndexes, OptionComponent, OptionButtonComponent, OptionLabelComponent, OptionBadgeComponent, OptionStartAdornmentComponent, OptionEndAdornmentComponent, }: SelectSingleContentProps<TItem>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
