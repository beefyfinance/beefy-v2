import type { TooltipOptions } from './types';
import { type MouseEventHandler, type ReactNode } from 'react';
export type ButtonWithTooltipProps = TooltipOptions & {
    tooltip: ReactNode;
    children: ReactNode;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
};
export declare const ButtonWithTooltip: ((props: TooltipOptions & {
    tooltip: ReactNode;
    children: ReactNode;
    className?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
} & import("react").RefAttributes<HTMLButtonElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
