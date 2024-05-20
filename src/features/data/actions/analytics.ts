import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getAnalyticsApi } from '../apis/instances';
import type {
  CLMTimelineAnalyticsEntity,
  VaultTimelineAnalyticsEntity,
} from '../entities/analytics';
import BigNumber from 'bignumber.js';
import type {
  AnalyticsPriceResponse,
  CLMTimelineAnalyticsConfig,
  TimeBucketType,
  TimelineAnalyticsConfig,
} from '../apis/analytics/analytics-types';
import type { VaultEntity } from '../entities/vault';
import { isFiniteNumber } from '../../../helpers/number';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';

export interface fetchWalletTimelineFulfilled {
  timeline: VaultTimelineAnalyticsEntity[];
  cowcentratedTimeline: CLMTimelineAnalyticsEntity[];
  walletAddress: string;
  state: BeefyState;
}

function makeTransactionId(config: TimelineAnalyticsConfig | CLMTimelineAnalyticsConfig): string {
  if (config.transaction_hash) {
    return config.transaction_hash;
  }

  // old data doesn't have transaction_hash so we try to make an id that is the same for a given vault/boost tx
  const shareDiff = new BigNumber(config.share_diff);
  return `${config.chain}-${config.datetime}-${shareDiff.absoluteValue().toString(10)}`;
}

export const fetchWalletTimeline = createAsyncThunk<
  fetchWalletTimelineFulfilled,
  { walletAddress: string },
  { state: BeefyState }
>('analytics/fetchWalletTimeline', async ({ walletAddress }, { getState }) => {
  const api = await getAnalyticsApi();

  const { databarnTimeline, clmTimeline } = await api.getWalletTimeline(walletAddress);

  const timeline = databarnTimeline.map((row): VaultTimelineAnalyticsEntity => {
    return {
      transactionId: makeTransactionId(row), // old data doesn't have transaction_hash
      datetime: new Date(row.datetime),
      productKey: row.product_key,
      displayName: row.display_name,
      chain: row.chain,
      isEol: row.is_eol,
      isDashboardEol: row.is_dashboard_eol,
      transactionHash: row.transaction_hash,
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

  const cowcentratedTimeline = clmTimeline.map((row): CLMTimelineAnalyticsEntity => {
    return {
      transactionId: makeTransactionId(row), // old data doesn't have transaction_hash
      datetime: new Date(row.datetime),
      productKey: row.product_key,
      displayName: row.display_name,
      chain: row.chain,
      isEol: row.is_eol,
      isDashboardEol: row.is_dashboard_eol,
      transactionHash: row.transaction_hash,
      token0ToUsd: new BigNumber(row.token0_to_usd),
      token1ToUsd: new BigNumber(row.token1_to_usd),
      underlying0Balance: new BigNumber(row.underlying0_balance),
      underlying1Balance: new BigNumber(row.underlying1_balance),
      underlying0Diff: new BigNumber(row.underlying0_diff),
      underlying1Diff: new BigNumber(row.underlying1_diff),
      usdBalance: isFiniteNumber(row.usd_balance) ? new BigNumber(row.usd_balance) : null,
      usdDiff: isFiniteNumber(row.usd_diff) ? new BigNumber(row.usd_diff) : null,
      shareBalance: new BigNumber(row.share_balance),
      shareDiff: new BigNumber(row.share_diff),
    };
  });

  return {
    timeline,
    cowcentratedTimeline,
    walletAddress: walletAddress.toLowerCase(),
    state: getState(),
  };
});

interface DataMartPricesFulfilled {
  data: AnalyticsPriceResponse;
  vaultId: VaultEntity['id'];
  timebucket: TimeBucketType;
  walletAddress: string;
  state: BeefyState;
}

interface DataMartPricesProps {
  timebucket: TimeBucketType;
  walletAddress: string;
  vaultId: VaultEntity['id'];
  productType: 'vault' | 'boost';
}

export const fetchShareToUnderlying = createAsyncThunk<
  DataMartPricesFulfilled,
  DataMartPricesProps,
  { state: BeefyState }
>(
  'analytics/fetchShareToUnderlying',
  async ({ productType, walletAddress, timebucket, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(
      productType,
      'share_to_underlying',
      timebucket,
      vault.earnContractAddress,
      vault.chainId
    );
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state,
    };
  }
);

export const fetchUnderlyingToUsd = createAsyncThunk<
  DataMartPricesFulfilled,
  DataMartPricesProps,
  { state: BeefyState }
>(
  'analytics/fetchUnderlyingToUsd',
  async ({ productType, timebucket, walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const api = await getAnalyticsApi();
    const data = await api.getVaultPrices(
      productType,
      'underlying_to_usd',
      timebucket,
      vault.earnContractAddress,
      vault.chainId
    );
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state,
    };
  }
);

export const fetchClmUnderlyingToUsd = createAsyncThunk<
  DataMartPricesFulfilled,
  Omit<DataMartPricesProps, 'productType'>,
  { state: BeefyState }
>(
  'analytics/fetchClmUnderlyingToUsd',
  async ({ timebucket, walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const vault = selectVaultById(state, vaultId);
    const token = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);
    const api = await getAnalyticsApi();
    const data = await api.getClmPrices(token.oracleId, timebucket);
    return {
      data,
      vaultId,
      timebucket,
      walletAddress: walletAddress.toLocaleLowerCase(),
      state,
    };
  }
);
