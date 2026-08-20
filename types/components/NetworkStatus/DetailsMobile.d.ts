import { type ReactNode } from 'react';
import type { ChainEntity } from '../../features/data/entities/chain';
type DetailsMobileProps = {
    header: ReactNode;
    content: ReactNode;
    footer: ReactNode;
    open: boolean;
    handleClose: () => void;
    editChainId: ChainEntity['id'] | null;
    setEditChainId: (id: ChainEntity['id'] | null) => void;
};
export declare const DetailsMobile: (({ open, handleClose, editChainId, setEditChainId, header, content, footer, }: DetailsMobileProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
