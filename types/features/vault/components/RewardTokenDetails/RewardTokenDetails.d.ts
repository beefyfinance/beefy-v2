import { type CssStyles } from '@repo/styles/css';
import { type ReactNode } from 'react';
import type { ChainEntity } from '../../../data/entities/chain';
import type { TokenEntity } from '../../../data/entities/token';
interface RewardTokenDetailsProps {
    address: TokenEntity['address'];
    chainId: ChainEntity['id'];
    css?: CssStyles;
    prependButtons?: ReactNode;
    appendText?: ReactNode;
}
export declare const RewardTokenDetails: (({ address, chainId, css: cssProp, prependButtons, appendText, }: RewardTokenDetailsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
