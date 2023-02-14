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
