import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getAnalyticsApi } from '../apis/instances';
import { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import BigNumber from 'bignumber.js';
import { TimeBucketType } from '../apis/analytics/analytics-types';
import { AnalyticsPriceResponse } from '../apis/analytics/analytics-types';
import { VaultEntity } from '../entities/vault';

export interface FetchAnalyticsVaultsFullfilled {
  timeline: VaultTimelineAnalyticsEntity[];
  state: BeefyState;
}

export const fetchAnalyticsVaults = createAsyncThunk<
  FetchAnalyticsVaultsFullfilled,
  { address: string },
  { state: BeefyState }
>('analytics/fetchVaults', async ({ address }, { getState }) => {
  const api = await getAnalyticsApi();

  const userTimeline = await api.getUserVaults(address);

  const timeline = userTimeline.map(row => {
    return {
      chain: row.chain,
      datetime: new Date(row.datetime),
      displayName: row.display_name,
      isEol: row.is_eol,
      productKey: row.product_key,
      shareBalance: new BigNumber(row.share_balance),
      shareDiff: new BigNumber(row.share_diff),
      shareToUnderlyingPrice: new BigNumber(row.share_to_underlying_price),
      underlyingBalance: new BigNumber(row.underlying_balance),
      underlyingDiff: new BigNumber(row.underlying_diff),
      underlyingToUsdPrice: new BigNumber(row.underlying_to_usd_price),
      usdBalance: new BigNumber(row.usd_balance),
      usdDiff: new BigNumber(row.usd_diff),
    };
  });

  return { timeline, state: getState() };
});

export type ResponseStatusType = 'idle' | 'pending' | 'fulfilled' | 'rejected';
interface DataMartPricesFullfilled {
  data: AnalyticsPriceResponse;
  vaultId: VaultEntity['id'];
  timebucket: TimeBucketType;
  status: ResponseStatusType;
  state: BeefyState;
}

interface DataMartPricesProps {
  productKey: string;
  timebucket: TimeBucketType;
  vaultId: VaultEntity['id'];
}

export const fetchShareToUndelying = createAsyncThunk<
  DataMartPricesFullfilled,
  DataMartPricesProps,
  { state: BeefyState }
>('analytics/fetchShareToUndelying', async ({ productKey, timebucket, vaultId }, { getState }) => {
  try {
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(productKey, 'share_to_underlying', timebucket);
    return { data, vaultId, timebucket, status: 'fulfilled', state: getState() };
  } catch (error) {
    const empty: AnalyticsPriceResponse = [];
    return { data: empty, vaultId, timebucket, status: 'rejected', state: getState() };
  }
});

export const fetchUnderlyingToUsd = createAsyncThunk<
  DataMartPricesFullfilled,
  DataMartPricesProps,
  { state: BeefyState }
>('analytics/fetchUnderlyingToUsd', async ({ productKey, timebucket, vaultId }, { getState }) => {
  try {
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(productKey, 'underlying_to_usd', timebucket);
    return { data, vaultId, timebucket, status: 'fulfilled', state: getState() };
  } catch (error) {
    const empty: AnalyticsPriceResponse = [];
    return { data: empty, vaultId, timebucket, status: 'rejected', state: getState() };
  }
});
