import { type VaultEntity } from '../../features/data/entities/vault';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type MobileVaultRewardsStatProps = {
    vaultId: VaultEntity['id'];
    walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;
export declare const MobileVaultRewardsStat: (({ vaultId, walletAddress, ...passthrough }: MobileVaultRewardsStatProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
