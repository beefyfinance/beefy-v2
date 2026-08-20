import { type ReactNode } from 'react';
import type { ChainId } from '../../../features/data/entities/chain';
export type ExplorerAddressLinkProps = {
    chainId: ChainId;
    address: string;
    children?: ReactNode;
};
export declare const ExplorerAddressLink: (({ chainId, address, children, }: ExplorerAddressLinkProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
