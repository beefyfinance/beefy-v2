import { type FunctionComponent, type SVGProps } from 'react';
import { type CssStyles } from '@repo/styles/css';
export type IconButtonLinkProps = {
    href: string;
    text: string;
    Icon: FunctionComponent<SVGProps<SVGSVGElement> & {
        title?: string;
    }>;
    css?: CssStyles;
    textCss?: CssStyles;
    iconCss?: CssStyles;
};
export declare const IconButtonLink: (({ href, text, Icon, css: cssProp, textCss, iconCss, }: IconButtonLinkProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
