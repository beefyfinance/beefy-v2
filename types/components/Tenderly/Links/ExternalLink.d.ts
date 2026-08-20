import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type ExternalLinkProps = {
    href: string;
    icon?: boolean;
    css?: CssStyles;
    children: ReactNode;
};
export declare const ExternalLink: (({ href, icon, css: cssProp, children, }: ExternalLinkProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
