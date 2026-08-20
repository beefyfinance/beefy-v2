import type { CalculatedAsset } from '../../types';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { type CssStyles } from '@repo/styles/css';
export type LegendProps = {
    chainId: ChainEntity['id'];
    assets: CalculatedAsset[];
    css?: CssStyles;
    isUnderlying?: boolean;
};
export declare const Legend: (({ chainId, assets, css: cssProp, isUnderlying, }: LegendProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
