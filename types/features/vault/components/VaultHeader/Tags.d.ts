import type { ChainEntity } from '../../../data/entities/chain';
import type { VaultEntity } from '../../../data/entities/vault';
export declare const ChainTag: (({ chainId }: {
    chainId: ChainEntity["id"];
}) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const PlatformTag: (({ vaultId }: {
    vaultId: VaultEntity["id"];
}) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export declare const Tag: import("@repo/styles/jsx").StyledComponent<"div", {}>;
