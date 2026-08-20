import { type FC, type ReactNode, type RefObject } from 'react';
import { type CssStyles } from '@repo/styles/css';
interface ContentComponents {
    css?: CssStyles;
}
interface ScrollabeDrawerProps {
    open: boolean;
    onClose: () => void;
    mainChildren: ReactNode;
    footerChildren: ReactNode;
    hideShadow?: boolean;
    mobileSpacingSize?: number;
    MainComponent?: FC<ContentComponents & {
        ref: RefObject<HTMLDivElement>;
    }>;
    LayoutComponent?: FC<ContentComponents>;
    FooterComponent?: FC<ContentComponents>;
}
export declare const ScrollableDrawer: import("react").NamedExoticComponent<ScrollabeDrawerProps>;
export declare const Layout: import("@repo/styles/jsx").StyledComponent<"div", {}>;
export declare const Main: import("@repo/styles/jsx").StyledComponent<"div", {}>;
export declare const Footer: import("@repo/styles/jsx").StyledComponent<"div", {}>;
export {};
