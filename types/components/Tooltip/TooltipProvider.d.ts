import { type ReactNode } from 'react';
import type { TooltipOptions } from './types';
export type TooltipProviderProps = TooltipOptions & {
    children: ReactNode;
};
export declare const TooltipProvider: (({ children, ...rest }: TooltipProviderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
