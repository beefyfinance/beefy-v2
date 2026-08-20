import { type CssStyles } from '@repo/styles/css';
export type ProviderIconProps = {
    provider: string;
    width?: number;
    css?: CssStyles;
};
export declare const ProviderIcon: (({ provider, css: cssProp, width, }: ProviderIconProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
