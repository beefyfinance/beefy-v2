import type { ReactNode } from 'react';
import { type CssStyles } from '@repo/styles/css';
import { type DivWithTooltipProps } from '../../../Tooltip/DivWithTooltip';
export type VaultTagProps = {
    css?: CssStyles;
    icon?: ReactNode;
    text: ReactNode;
    order?: 'icon-text' | 'text-icon';
};
export declare const VaultTag: ((props: VaultTagProps & import("react").RefAttributes<HTMLDivElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
export type VaultTagWithTooltipProps = VaultTagProps & Omit<DivWithTooltipProps, 'children' | 'className'>;
export declare const VaultTagWithTooltip: ((props: VaultTagProps & Omit<DivWithTooltipProps, "className" | "children"> & import("react").RefAttributes<HTMLDivElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
