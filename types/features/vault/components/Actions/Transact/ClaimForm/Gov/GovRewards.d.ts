import type { ChainEntity } from '../../../../../../data/entities/chain';
import { type VaultEntity } from '../../../../../../data/entities/vault';
type GovRewardsProps = {
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
    walletAddress?: string;
    deposited: boolean;
};
export declare const GovRewards: (({ vaultId, chainId, walletAddress, deposited, }: GovRewardsProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
