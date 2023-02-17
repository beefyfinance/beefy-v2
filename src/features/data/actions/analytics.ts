import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getAnalyticsApi } from '../apis/instances';
import { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import BigNumber from 'bignumber.js';

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
