import { type CssStyles } from '@repo/styles/css';
export type DescriptionLinkProps = {
    href: string;
    label: string;
    css?: CssStyles;
};
export declare const DescriptionLink: (({ href, label, css: cssProp, }: DescriptionLinkProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
