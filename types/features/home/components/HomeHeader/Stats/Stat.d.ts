import { type ReactNode } from 'react';
export type StatProps = {
    label: string | ReactNode;
    value: string | ReactNode;
    tooltip?: string;
    blurred?: boolean;
    loading?: boolean;
    onInfo?: () => void;
    onClick?: () => void;
};
export declare const Stat: import("react").NamedExoticComponent<StatProps>;
