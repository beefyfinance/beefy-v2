import type { ChainEntity } from '../../features/data/entities/chain';
export declare const NotificationRpcChains: (({ onOpenDropdown, chains, }: {
    onOpenDropdown: () => void;
    chains: ChainEntity["id"][];
}) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
