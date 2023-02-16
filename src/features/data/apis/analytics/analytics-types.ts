export interface TimelineAnalyticsConfig {
  chain: string;
  datetime: string;
  display_name: string;
  is_eol: boolean;
  product_key: string;
  share_balance: number;
  share_diff: number;
  share_to_underlying_price: number;
  underlying_balance: number;
  underlying_diff: number;
  underlying_to_usd_price: number;
  usd_balance: number;
  usd_diff: number;
}

export type AnalyticsUserTimelineResponse = TimelineAnalyticsConfig[];

export interface PriceAnalyticsConfig {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export type PriceType = 'share_to_underlying' | 'underlying_to_usd' | 'pending_rewards_to_usd';

export type TimeBucketType = '1h_1d' | '1h_1w' | '1d_1M' | '1d_1Y';

export type AnalyticsPriceResponse = PriceAnalyticsConfig[];
