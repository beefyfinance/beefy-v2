import type { ChainEntity } from '../../../../../../data/entities/chain';
import { type VaultEntity } from '../../../../../../data/entities/vault';
type MerklRewardsProps = {
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
    walletAddress?: string;
    deposited: boolean;
};
export declare const MerklRewards: (({ vaultId, chainId, walletAddress, deposited, }: MerklRewardsProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
