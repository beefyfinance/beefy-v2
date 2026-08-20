import { type ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type ScrollDirection = 'horizontal' | 'vertical';
export type ScrollableProps = {
    children: ReactNode;
    autoHeight?: boolean | number;
    css?: CssStyles;
    shadowCss?: CssStyles;
    topShadowCss?: CssStyles;
    bottomShadowCss?: CssStyles;
    leftShadowCss?: CssStyles;
    rightShadowCss?: CssStyles;
    thumbCss?: CssStyles;
    hideShadows?: boolean;
    scrollContainer?: boolean;
};
export declare const Scrollable: (({ children, css: cssProp, shadowCss, topShadowCss, bottomShadowCss, leftShadowCss, rightShadowCss, thumbCss, autoHeight, hideShadows, scrollContainer, }: ScrollableProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
