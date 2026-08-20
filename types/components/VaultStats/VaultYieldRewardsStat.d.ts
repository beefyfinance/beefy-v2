import { type VaultEntity } from '../../features/data/entities/vault';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat';
export type VaultYieldRewardsStatProps = {
    vaultId: VaultEntity['id'];
    walletAddress: string;
} & Omit<VaultValueStatProps, 'label' | 'tooltip' | 'value' | 'subValue' | 'loading'>;
export declare const VaultYieldRewardsStat: (({ vaultId, walletAddress, ...passthrough }: VaultYieldRewardsStatProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
