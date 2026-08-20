import { type PropsWithChildren } from 'react';
type VisibleAboveProps = PropsWithChildren<{
    width: number;
}>;
/** @dev use <Visible/> or <Hidden/> if matching a breakdown */
export declare const VisibleAbove: (({ width, children }: VisibleAboveProps) => import("react").ReactNode) & {
    displayName?: string;
};
export {};
