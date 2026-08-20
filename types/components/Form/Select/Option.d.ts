import type { SelectItem, OptionProps } from './types';
export declare const Option: (<TItem extends SelectItem = SelectItem>(props: OptionProps<TItem> & import("react").RefAttributes<HTMLButtonElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
