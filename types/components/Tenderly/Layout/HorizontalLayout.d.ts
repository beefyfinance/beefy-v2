import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type HorizontalLayoutProps = {
    css?: CssStyles;
    gap?: number;
    children: ReactNode;
};
export declare const HorizontalLayout: (({ css: cssProp, gap, children, }: HorizontalLayoutProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
