import { type ReactNode } from 'react';
import { type DialogVariantProps } from './Dialog';
export type ModalProps = {
    children: ReactNode;
    open: boolean;
    onClose: () => void;
    layer?: 0 | 1 | 2;
    scrollable?: boolean;
    position?: DialogVariantProps['position'];
};
export declare const Modal: import("react").NamedExoticComponent<ModalProps>;
