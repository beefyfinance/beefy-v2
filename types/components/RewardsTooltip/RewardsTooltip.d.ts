import type { VaultEntity } from '../../features/data/entities/vault';
import { type UserRewards, type UserRewardStatus } from '../../features/data/selectors/dashboard';
export type PendingRewardsIconWithTooltipForVaultProps = {
    vaultId: VaultEntity['id'];
    size?: number;
    walletAddress?: string;
};
export declare const PendingRewardsIconWithTooltipForVault: (({ vaultId, walletAddress, ...rest }: PendingRewardsIconWithTooltipForVaultProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
type PendingRewardsIconWithTooltipProps = {
    rewards: UserRewards;
    size?: number;
};
export declare const PendingRewardsIconWithTooltip: (({ rewards, size, }: PendingRewardsIconWithTooltipProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export type RewardsTooltipContentProps = {
    rewards: UserRewards;
} & {
    [status in UserRewardStatus]?: boolean;
};
export declare const RewardsTooltipContent: (({ rewards, pending, claimed, compounded, }: RewardsTooltipContentProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
