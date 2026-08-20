import { type CssStyles } from '@repo/styles/css';
export type LoadingIndicatorProps = {
    text?: string;
    css?: CssStyles;
    height?: number;
    iconSize?: number;
};
export declare const LoadingIndicator: (({ text, height, iconSize, }: LoadingIndicatorProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
