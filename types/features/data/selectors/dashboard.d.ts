import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
import { type PnlYieldSource, type UserVaultPnl } from './analytics-types';
export declare enum DashboardDataStatus {
    Loading = 0,
    Missing = 1,
    Available = 2
}
export declare const selectUserTotalYieldUsd: (state: BeefyState, walletAddress: string) => BigNumber;
export type UserRewardStatus = 'compounded' | 'pending' | 'claimed';
export type UserRewardSource = PnlYieldSource['source'] | 'gov' | 'boost';
export type UserReward = {
    token: Pick<TokenEntity, 'symbol' | 'decimals' | 'address' | 'chainId'>;
    amount: BigNumber;
    usd: BigNumber;
    status: UserRewardStatus;
    source: UserRewardSource;
};
type UserRewardsStatusEntry = {
    has: boolean;
    usd: BigNumber;
    rewards: UserReward[];
};
export type UserRewards = {
    [status in UserRewardStatus]: UserRewardsStatusEntry;
} & {
    all: UserRewardsStatusEntry;
};
/**
 * @dev requires analytics timeline / user pnl to be loaded
 */
export declare const selectDashboardUserRewardsByVaultId: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => UserRewards;
export declare const selectDashboardUserRewardsOrStatusByVaultId: (state: BeefyState, vaultId: VaultEntity["id"], walletAddress?: string) => UserRewards | Exclude<DashboardDataStatus, DashboardDataStatus.Available>;
type DashboardUserExposureVaultEntry = {
    key: string;
    label: string;
    value: BigNumber;
};
type DashboardUserExposureEntry<T extends DashboardUserExposureVaultEntry = DashboardUserExposureVaultEntry> = T & {
    percentage: number;
};
type DashboardUserTokenExposureVaultEntry = DashboardUserExposureVaultEntry & {
    symbols: string[];
    chainId: ChainEntity['id'];
};
type DashboardUserChainExposureVaultEntry = DashboardUserExposureVaultEntry & {
    chainId: ChainEntity['id'] | 'others';
};
export declare const selectDashboardUserExposureByChain: (state: BeefyState, walletAddress?: string) => DashboardUserExposureEntry<DashboardUserChainExposureVaultEntry>[];
export declare const selectDashboardUserExposureByPlatform: (state: BeefyState, walletAddress?: string) => DashboardUserExposureEntry<DashboardUserExposureVaultEntry>[];
export declare const selectDashboardUserExposureByToken: (state: BeefyState, walletAddress?: string) => DashboardUserExposureEntry<DashboardUserTokenExposureVaultEntry>[];
export declare const selectDashboardUserStablecoinsExposure: (state: BeefyState, walletAddress: string) => DashboardUserExposureEntry<DashboardUserExposureVaultEntry>[];
export declare const selectDashboardUserVaultsPnl: (state: BeefyState, walletAddress: string) => Record<string, UserVaultPnl>;
export declare const selectDashboardUserVaultsDailyYield: (state: BeefyState, walletAddress: string) => Record<string, BigNumber>;
export declare const selectShouldInitDashboardForUser: (state: BeefyState, walletAddress: string) => boolean;
export {};
