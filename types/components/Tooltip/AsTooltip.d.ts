import type { TooltipOptions } from './types';
import { type ReactElement, type ReactNode } from 'react';
export type AsTooltipProps = TooltipOptions & {
    content: ReactNode;
    children: ReactElement;
};
/**
 * @deprecated try to avoid this as it is not good practice to use cloneElement
 */
export declare const AsTooltip: (({ children, content, ...rest }: AsTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
