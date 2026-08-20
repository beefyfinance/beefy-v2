import type { ChainEntity } from '../../../../../../data/entities/chain';
import { type VaultEntity } from '../../../../../../data/entities/vault';
type StellaSwapRewardsProps = {
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
    walletAddress?: string;
    deposited: boolean;
};
export declare const StellaSwapRewards: (({ vaultId, chainId, walletAddress, deposited, }: StellaSwapRewardsProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
