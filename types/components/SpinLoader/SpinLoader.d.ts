import { type CssStyles } from '@repo/styles/css';
export type SpinLoaderProps = {
    size?: number;
    css?: CssStyles;
};
export declare const SpinLoader: (({ size, css: cssProp }: SpinLoaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
