import type { ReactNode } from 'react';
import type { BridgeEntity } from '../../../data/entities/bridge';
import { type CssStyles } from '@repo/styles/css';
import type { ChainEntity } from '../../../data/entities/chain';
import { type DivWithTooltipProps } from '../../../../components/Tooltip/DivWithTooltip';
export type NativeTagProps = {
    chain: ChainEntity;
    css?: CssStyles;
};
export declare const NativeTag: (({ chain, css: cssProp }: NativeTagProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type BridgeTagProps = {
    bridge: BridgeEntity;
    chain: ChainEntity;
    css?: CssStyles;
};
export declare const BridgeTag: (({ bridge, chain, css: cssProp }: BridgeTagProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type NativeTooltipProps = {
    chain: ChainEntity;
};
export type BridgeTooltipProps = {
    bridge: BridgeEntity;
    chain: ChainEntity;
};
export type TagTooltipProps = {
    content: ReactNode;
};
export declare const TagTooltip: (({ content }: TagTooltipProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const TagWithTooltip: ((props: {
    css?: CssStyles;
    children: ReactNode;
} & Omit<DivWithTooltipProps, "className" | "children"> & import("react").RefAttributes<HTMLDivElement>) => import("react").ReactElement | null) & {
    displayName?: string;
};
