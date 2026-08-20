import { type CssStyles } from '@repo/styles/css';
export type ErrorProps = {
    css?: CssStyles;
};
export declare const ErrorMessage: (({ css: cssProp }: ErrorProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
