import { type CssStyles } from '@repo/styles/css';
export type TechLoaderProps = {
    css?: CssStyles;
    text?: string;
};
export declare const TechLoader: (({ text, css: cssProp }: TechLoaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const FullscreenTechLoader: (({ text }: TechLoaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
