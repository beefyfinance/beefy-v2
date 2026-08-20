import type { ChainEntity } from '../../features/data/entities/chain';
import { type CssStyles } from '@repo/styles/css';
export type ChainIconProps = {
    chainId: ChainEntity['id'];
    css?: CssStyles;
    size?: number;
};
export declare const ChainIcon: (({ chainId, css: cssProp, size, }: ChainIconProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
