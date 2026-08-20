import type { SelectItem } from '../../../../components/Form/Select/types';
export type StatSwitcherProps<T extends string = string> = {
    options: Array<SelectItem<T>>;
    stat: T;
    onChange: (newStat: T) => void;
};
export declare const StatSwitcher: (<T extends string = string>({ options, onChange, stat, }: StatSwitcherProps<T>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
