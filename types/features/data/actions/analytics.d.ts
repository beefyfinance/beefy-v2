import BigNumber from 'bignumber.js';
import type { ApiClassicHarvestRow, ApiClmHarvestRow, ClmPendingRewardsResponse, ClmPriceHistoryEntry, ClmPriceHistoryEntryClassic, ClmPriceHistoryEntryClm } from '../apis/clm/clm-api-types';
import type { DatabarnProductPriceRow, DatabarnTimeBucket } from '../apis/databarn/databarn-types';
import { type AnyTimelineEntity } from '../entities/analytics';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import { type VaultEntity } from '../entities/vault';
import type { BeefyState } from '../store/types';
export interface FetchWalletTimelineFulfilled {
    timelines: Record<VaultEntity['id'], AnyTimelineEntity>;
    walletAddress: string;
}
export declare const fetchWalletTimeline: import("@reduxjs/toolkit").AsyncThunk<FetchWalletTimelineFulfilled, {
    walletAddress: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface DataBarnPricesFulfilled {
    data: DatabarnProductPriceRow[];
    vaultId: VaultEntity['id'];
    timeBucket: DatabarnTimeBucket;
}
interface DataBarnPricesProps {
    timeBucket: DatabarnTimeBucket;
    vaultId: VaultEntity['id'];
}
export declare const fetchShareToUnderlying: import("@reduxjs/toolkit").AsyncThunk<DataBarnPricesFulfilled, DataBarnPricesProps, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    pendingMeta: {
        since: number;
    };
    fulfilledMeta: {
        since: number;
    };
    rejectedMeta: {
        since: number;
    };
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
}>;
interface ClmPriceHistoryFulfilled<T extends ClmPriceHistoryEntry> {
    data: T[];
    vaultId: VaultEntity['id'];
    timeBucket: DatabarnTimeBucket;
}
interface ClmPriceHistoryParams {
    timeBucket: DatabarnTimeBucket;
    vaultId: VaultEntity['id'];
}
export declare const fetchCowcentratedPriceHistoryClassic: import("@reduxjs/toolkit").AsyncThunk<ClmPriceHistoryFulfilled<ClmPriceHistoryEntryClassic>, ClmPriceHistoryParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    pendingMeta: {
        since: number;
    };
    fulfilledMeta: {
        since: number;
    };
    rejectedMeta: {
        since: number;
    };
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
}>;
export declare const fetchCowcentratedPriceHistoryClm: import("@reduxjs/toolkit").AsyncThunk<ClmPriceHistoryFulfilled<ClmPriceHistoryEntryClm>, ClmPriceHistoryParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    pendingMeta: {
        since: number;
    };
    fulfilledMeta: {
        since: number;
    };
    rejectedMeta: {
        since: number;
    };
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
}>;
/**
 * Dispatches fetchClmHarvestsForVaultsOfUserOnChain for the vault id
 */
export declare const fetchClmHarvestsForUserVault: import("@reduxjs/toolkit").AsyncThunk<void, {
    vaultId: VaultEntity["id"];
    walletAddress: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
/**
 * Dispatches a fetchClmHarvestsForVaultsOfUserOnChain action for each chain the user has deposited in a CLM vault
 */
export declare const fetchClmHarvestsForUser: import("@reduxjs/toolkit").AsyncThunk<void, {
    walletAddress: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type FetchClmHarvestsForUserResult = {
    type: 'clm';
    harvests: ApiClmHarvestRow[];
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
} | {
    type: 'classic';
    harvests: ApiClassicHarvestRow[];
    vaultId: VaultEntity['id'];
    chainId: ChainEntity['id'];
};
type FetchClmHarvestsForUserFulfilledAction = Array<FetchClmHarvestsForUserResult>;
/**
 * Fetches all harvests for all cowcentrated vaults the user has deposited in on a specific chain
 */
export declare const fetchClmHarvestsForVaultsOfUserOnChain: import("@reduxjs/toolkit").AsyncThunk<FetchClmHarvestsForUserFulfilledAction, {
    walletAddress: string;
    chainId: ChainEntity["id"];
    vaultIds: VaultEntity["id"][];
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export type ClmUserHarvestsTimelineHarvest = {
    timestamp: Date;
    /** price of tokens at this harvest, one entry per ClmHarvestTimeline['tokens'] */
    prices: BigNumber[];
    /** token amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
    amounts: BigNumber[];
    /** usd amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
    amountsUsd: BigNumber[];
    /** usd total for this harvest (sum of all amountsUsd) */
    totalUsd: BigNumber;
    /** cumulative token amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
    cumulativeAmounts: BigNumber[];
    /** cumulative usd amounts for this harvest, one entry per ClmHarvestTimeline['tokens'] */
    cumulativeAmountsUsd: BigNumber[];
    /** cumulative total usd */
    cumulativeTotalUsd: BigNumber;
};
export type ClmUserHarvestsTimeline = {
    tokens: TokenEntity[];
    /** one entry per harvest */
    harvests: ClmUserHarvestsTimelineHarvest[];
    /** total token amounts, one entry per tokens */
    totals: BigNumber[];
    /** total usd amounts, one entry per tokens */
    totalsUsd: BigNumber[];
    /** overall total usd amount */
    totalUsd: BigNumber;
};
export type RecalculateClmHarvestsForUserVaultIdPayload = {
    vaultId: VaultEntity['id'];
    walletAddress: string;
    timeline: ClmUserHarvestsTimeline;
};
/**
 * Needs: User Timeline, Vault Harvests and User Balances
 */
export declare const recalculateClmPoolHarvestsForUserVaultId: import("@reduxjs/toolkit").AsyncThunk<RecalculateClmHarvestsForUserVaultIdPayload, {
    walletAddress: string;
    vaultId: VaultEntity["id"];
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
/**
 * Needs: User Timeline, Vault Harvests and User Balances
 */
export declare const recalculateClmVaultHarvestsForUserVaultId: import("@reduxjs/toolkit").AsyncThunk<RecalculateClmHarvestsForUserVaultIdPayload, {
    walletAddress: string;
    vaultId: VaultEntity["id"];
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface FetchClmPendingRewardsFulfilledAction {
    data: ClmPendingRewardsResponse;
    vaultIds: VaultEntity['id'][];
}
export declare const fetchClmPendingRewards: import("@reduxjs/toolkit").AsyncThunk<FetchClmPendingRewardsFulfilledAction, {
    vaultId: VaultEntity["id"];
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const initDashboardByAddress: import("@reduxjs/toolkit").AsyncThunk<{
    walletAddress: string;
}, {
    walletAddress: string;
}, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
