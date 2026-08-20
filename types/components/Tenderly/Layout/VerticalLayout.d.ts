import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type VerticalLayoutProps = {
    css?: CssStyles;
    gap?: number;
    children: ReactNode;
};
export declare const VerticalLayout: (({ css: cssProp, gap, children, }: VerticalLayoutProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
