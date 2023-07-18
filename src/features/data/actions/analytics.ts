import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getAnalyticsApi } from '../apis/instances';
import type { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import BigNumber from 'bignumber.js';
import type { AnalyticsPriceResponse, TimeBucketType } from '../apis/analytics/analytics-types';
import type { VaultEntity } from '../entities/vault';
import { isFiniteNumber } from '../../../helpers/number';

export interface fetchWalletTimelineFulfilled {
  timeline: VaultTimelineAnalyticsEntity[];
  walletAddress: string;
  state: BeefyState;
}

export const fetchWalletTimeline = createAsyncThunk<
  fetchWalletTimelineFulfilled,
  { address: string },
  { state: BeefyState }
>('analytics/fetchWalletTimeline', async ({ address }, { getState }) => {
  const api = await getAnalyticsApi();

  const userTimeline = await api.getWalletTimeline(address);

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
      underlyingToUsdPrice: isFiniteNumber(row.underlying_to_usd_price)
        ? new BigNumber(row.underlying_to_usd_price)
        : null,
      usdBalance: isFiniteNumber(row.usd_balance) ? new BigNumber(row.usd_balance) : null,
      usdDiff: isFiniteNumber(row.usd_diff) ? new BigNumber(row.usd_diff) : null,
    };
  });

  return { timeline, walletAddress: address.toLowerCase(), state: getState() };
});

interface DataMartPricesFulfilled {
  data: AnalyticsPriceResponse;
  vaultId: VaultEntity['id'];
  timebucket: TimeBucketType;
  walletAddress: string;
  state: BeefyState;
}

interface DataMartPricesProps {
  productKey: string;
  timebucket: TimeBucketType;
  walletAddress: string;
  vaultId: VaultEntity['id'];
}

export const fetchShareToUnderlying = createAsyncThunk<
  DataMartPricesFulfilled,
  DataMartPricesProps,
  { state: BeefyState }
>(
  'analytics/fetchShareToUnderlying',
  async ({ productKey, walletAddress, timebucket, vaultId }, { getState }) => {
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(productKey, 'share_to_underlying', timebucket);
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state: getState(),
    };
  }
);

export const fetchUnderlyingToUsd = createAsyncThunk<
  DataMartPricesFulfilled,
  DataMartPricesProps,
  { state: BeefyState }
>(
  'analytics/fetchUnderlyingToUsd',
  async ({ productKey, timebucket, walletAddress, vaultId }, { getState }) => {
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(productKey, 'underlying_to_usd', timebucket);
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state: getState(),
    };
  }
);
