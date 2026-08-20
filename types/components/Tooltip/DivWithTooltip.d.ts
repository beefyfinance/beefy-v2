import { type MouseEventHandler, type ReactNode } from 'react';
import type { TooltipOptions } from './types';
export type DivWithTooltipProps = TooltipOptions & {
    tooltip: ReactNode;
    children: ReactNode;
    className?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
};
export declare const DivWithTooltip: ((props: TooltipOptions & {
    tooltip: ReactNode;
    children: ReactNode;
    className?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
} & import("react").RefAttributes<HTMLDivElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
