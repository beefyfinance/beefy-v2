import type { StyledVariantProps } from '@repo/styles/types';
import { type ReactNode } from 'react';
type BackdropProps = StyledVariantProps<typeof Backdrop>;
export type OverlayProps = BackdropProps & {
    onClose: () => void;
    children: ReactNode;
};
export declare const Overlay: (({ onClose, children, ...rest }: OverlayProps) => import("react").ReactPortal) & {
    displayName?: string;
};
declare const Backdrop: import("@repo/styles/types").StyledComponent<"div", {
    scrollable?: boolean | undefined;
    layer?: 0 | 1 | 2 | undefined;
}>;
export {};
