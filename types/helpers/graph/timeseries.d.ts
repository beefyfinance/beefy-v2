import BigNumber from 'bignumber.js';
import type { DatabarnProductPriceRow } from '../../features/data/apis/databarn/databarn-types';
import { type TimelineEntryCowcentratedPool, type TimelineEntryCowcentratedVault, type TimelineEntryStandard } from '../../features/data/entities/analytics';
import type { ClmUserHarvestsTimeline } from '../../features/data/actions/analytics';
import type { ApiPoint } from '../../features/data/apis/beefy/beefy-data-api-types';
import type { GraphBucket } from './types';
import type { ClmPriceHistoryEntryClassic, ClmPriceHistoryEntryClm } from '../../features/data/apis/clm/clm-api-types';
export interface PriceTsRow {
    datetime: number;
    shareBalance: number | null;
    underlyingBalance: number | null;
    usdBalance: number | null;
}
export declare function getInvestorTimeseries(timeBucket: GraphBucket, timeline: TimelineEntryStandard[], sharesToUnderlying: DatabarnProductPriceRow[], underlyingToUsd: ApiPoint[], firstDate: Date, currentPpfs: BigNumber, currentPrice: BigNumber, currentShareBalance: BigNumber): PriceTsRow[];
export type ClmInvestorOverviewTimeSeriesPoint = {
    /** unix timestamp in milliseconds */
    timestamp: number;
    shares: number;
    underlying: number;
    underlyingUsd: number;
    heldUsd: number;
    debug: {
        sharesToUnderlying: BigNumber;
        underlyingToToken0: BigNumber;
        underlyingToToken1: BigNumber;
        underlyingToUsd: BigNumber;
        token0ToUsd: BigNumber;
        token1ToUsd: BigNumber;
        sharesAtDeposit: BigNumber;
        underlying: BigNumber;
        token0: BigNumber;
        token1: BigNumber;
        underlyingUsd: BigNumber;
        token0Usd: BigNumber;
        token1Usd: BigNumber;
        token0AtDeposit: BigNumber;
        token1AtDeposit: BigNumber;
        token0AtDepositUsd: BigNumber;
        token1AtDepositUsd: BigNumber;
        heldUsd: BigNumber;
    };
};
export declare function getClmInvestorTimeSeries(timeBucket: GraphBucket, timeline: TimelineEntryCowcentratedPool[] | TimelineEntryCowcentratedVault[], underlyingToUsd: ApiPoint[], underlying0ToUsd: ApiPoint[], underlying1ToUsd: ApiPoint[], firstDepositDate: Date, nowBalanceShares: BigNumber, nowBalanceUnderlying: BigNumber, nowBalanceToken0: BigNumber, nowBalanceToken1: BigNumber, nowPricePerFullShare: BigNumber, nowPriceUnderlying: BigNumber, nowPriceToken0: BigNumber, nowPriceToken1: BigNumber, clmHistory: ClmPriceHistoryEntryClm[], vaultHistory: ClmPriceHistoryEntryClassic[] | undefined): ClmInvestorOverviewTimeSeriesPoint[];
export type ClmInvestorFeesTimeSeriesPoint = {
    /** unix timestamp in milliseconds */
    t: number;
    /** cumulative usd per token */
    values: number[];
    /** cumulative amount per token */
    amounts: BigNumber[];
};
export declare function getClmInvestorFeesTimeSeries(timeBucket: GraphBucket, timeline: ClmUserHarvestsTimeline, firstDepositDate: Date): ClmInvestorFeesTimeSeriesPoint[] | undefined;
