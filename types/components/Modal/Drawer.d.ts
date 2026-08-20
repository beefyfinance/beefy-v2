import { type ReactNode } from 'react';
import { type DialogVariantProps } from './Dialog';
export type DrawerProps = {
    children: ReactNode;
    open: boolean;
    onClose: () => void;
    position?: DialogVariantProps['position'];
    layer?: 0 | 1 | 2;
    scrollable?: boolean;
};
export declare const Drawer: import("react").NamedExoticComponent<DrawerProps>;
