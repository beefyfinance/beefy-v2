import type { ChainEntity } from '../../../../../../../data/entities/chain';
import { type CssStyles } from '@repo/styles/css';
import type { TokenEntity } from '../../../../../../../data/entities/token';
import type BigNumber from 'bignumber.js';
export type ListItemProps = {
    selectionId: string;
    tokens: TokenEntity[];
    balance?: BigNumber;
    balanceValue?: BigNumber;
    decimals: number;
    chainId: ChainEntity['id'];
    onSelect: (id: string) => void;
    css?: CssStyles;
    tag?: string;
};
export declare const ListItem: (({ selectionId, tokens, decimals, balance, balanceValue, css: cssProp, onSelect, tag, }: ListItemProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
