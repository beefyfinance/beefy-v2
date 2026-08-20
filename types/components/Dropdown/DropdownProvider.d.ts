import { type ReactNode } from 'react';
import type { DropdownOptions } from './types';
export type DropdownProviderProps = DropdownOptions & {
    children: ReactNode;
};
export declare const DropdownProvider: (({ children, ...rest }: DropdownProviderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
