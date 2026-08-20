import { type ComponentType } from 'react';
export type TabOption<TValue extends string = string, TContext = unknown> = {
    value: TValue;
    label: string;
    context?: TContext;
};
export type CardHeaderTabsProps<T extends TabOption = TabOption> = {
    selected: T['value'];
    options: T[];
    onChange: (value: T['value']) => void;
    TabComponent?: ComponentType<TabProps<T['value'], T['context']>>;
};
export declare const CardHeaderTabs: (<T extends TabOption = TabOption<string, unknown>>({ selected, options, onChange, TabComponent, }: CardHeaderTabsProps<T>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type TabProps<TValue extends string = string, TContext = unknown> = {
    value: TValue;
    label: string;
    onChange: (selected: TValue) => void;
    selected: boolean;
    context?: TContext;
};
