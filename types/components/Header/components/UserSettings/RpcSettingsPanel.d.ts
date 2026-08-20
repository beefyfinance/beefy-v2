import type { ChainEntity } from '../../../../features/data/entities/chain';
export declare const RpcSettingsPanel: (({ chainsWithErrors, editChainId, setEditChainId, }: {
    chainsWithErrors: ChainEntity["id"][];
    editChainId: ChainEntity["id"] | null;
    setEditChainId: (chainId: ChainEntity["id"] | null) => void;
}) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const PanelContent: import("@repo/styles/jsx").StyledComponent<"div", {}>;
