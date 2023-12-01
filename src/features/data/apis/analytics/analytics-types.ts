import type BigNumber from 'bignumber.js';

export interface TimelineAnalyticsConfig {
  datetime: string;
  product_key: string;
  display_name: string;
  chain: string;
  is_eol: boolean;
  is_dashboard_eol: boolean;
  transaction_hash: string;
  share_balance: number;
  share_diff: number;
  share_to_underlying_price: number;
  underlying_balance: number;
  underlying_diff: number;
  underlying_to_usd_price: number | null;
  usd_balance: number | null;
  usd_diff: number | null;
}

export type AnalyticsUserTimelineResponse = TimelineAnalyticsConfig[];

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
