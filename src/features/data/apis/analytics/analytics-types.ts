import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain';

export interface CommonTimelineAnalyticsConfig {
  chain: ChainEntity['id'];
  datetime: string;
  display_name: string;
  is_dashboard_eol: boolean;
  is_eol: boolean;
  product_key: string;
  share_balance: number;
  share_diff: number;
  transaction_hash: string;
  usd_balance: number | null;
  usd_diff: number | null;
}
export type TimelineAnalyticsConfig = CommonTimelineAnalyticsConfig & {
  share_to_underlying_price: number;
  underlying_balance: number;
  underlying_diff: number;
  underlying_to_usd_price: number | null;
};

export type CLMTimelineAnalyticsConfig = CommonTimelineAnalyticsConfig & {
  token0_to_usd: number;
  token1_to_usd: number;
  underlying0_balance: number;
  underlying1_balance: number;
  underlying0_diff: number;
  underlying1_diff: number;
};

export type AnalyticsUserTimelineResponse = {
  clmTimeline: CLMTimelineAnalyticsConfig[];
  databarnTimeline: TimelineAnalyticsConfig[];
};

export interface PriceAnalyticsConfig {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface ApiProductPriceRow {
  date: Date;
  value: BigNumber;
}

export type PriceType = 'share_to_underlying' | 'underlying_to_usd' | 'pending_rewards_to_usd';

export type TimeBucketType = '1h_1d' | '1h_1w' | '1h_1M' | '4h_3M' | '1d_1M' | '1d_1Y' | '1d_all';

export type AnalyticsPriceResponse = ApiProductPriceRow[];
