import type { ChartStat } from '../../vault/components/HistoricGraph/types';
import type { ApiChartData, ApiCowcentratedChartData, ApiRanges, ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { ClmPriceHistoryEntryClm } from '../apis/clm/clm-api-types';
import type { TokenEntity } from '../entities/token';
import { type VaultEntity } from '../entities/vault';
import type { BeefyThunk } from '../store/types';
export interface HistoricalRangesPayload {
    vaultId: VaultEntity['id'];
    oracleId: TokenEntity['oracleId'];
    ranges: ApiRanges;
    isCowcentrated: boolean;
}
export interface HistoricalRangesParams {
    vaultId: VaultEntity['id'];
}
export declare const fetchHistoricalRanges: import("@reduxjs/toolkit").AsyncThunk<HistoricalRangesPayload, HistoricalRangesParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface HistoricalApysPayload {
    data: ApiChartData;
}
export interface HistoricalApysParams {
    vaultId: VaultEntity['id'];
    bucket: ApiTimeBucket;
}
export declare const fetchHistoricalApys: import("@reduxjs/toolkit").AsyncThunk<HistoricalApysPayload, HistoricalApysParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface HistoricalTvlsPayload {
    data: ApiChartData;
}
export interface HistoricalTvlsParams {
    vaultId: VaultEntity['id'];
    bucket: ApiTimeBucket;
}
export declare const fetchHistoricalTvls: import("@reduxjs/toolkit").AsyncThunk<HistoricalTvlsPayload, HistoricalTvlsParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface HistoricalPricesPayload {
    data: ApiChartData;
}
export interface HistoricalPricesParams {
    oracleId: TokenEntity['oracleId'];
    bucket: ApiTimeBucket;
}
export declare const fetchHistoricalPrices: import("@reduxjs/toolkit").AsyncThunk<HistoricalPricesPayload, HistoricalPricesParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface HistoricalCowcentratedPayload {
    data: ApiCowcentratedChartData;
    rawData: ClmPriceHistoryEntryClm[];
}
export interface HistoricalCowcentratedParams {
    vaultId: VaultEntity['id'];
    bucket: ApiTimeBucket;
}
export declare const fetchHistoricalCowcentratedRanges: import("@reduxjs/toolkit").AsyncThunk<HistoricalCowcentratedPayload, HistoricalCowcentratedParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare function fetchHistoricalStat(stat: ChartStat, vaultId: VaultEntity['id'], oracleId: TokenEntity['oracleId'], bucket: ApiTimeBucket): BeefyThunk;
