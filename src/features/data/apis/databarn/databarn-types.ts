import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain.ts';

export type DatabarnTimelineEntry = {
  chain: ChainEntity['id'];
  datetime: string;
  display_name: string;
  is_dashboard_eol: boolean;
  is_eol: boolean;
  product_key: string;
  transaction_hash: string | null;
  share_balance: number;
  share_diff: number;
  usd_balance: number | null;
  usd_diff: number | null;
  share_to_underlying_price: number;
  underlying_balance: number;
  underlying_diff: number;
  underlying_to_usd_price: number | null;
};

export interface DatabarnProductPriceRow {
  date: Date;
  value: BigNumber;
}

export type DatabarnPriceType =
  | 'share_to_underlying'
  | 'underlying_to_usd'
  | 'pending_rewards_to_usd';

export type DatabarnTimeBucket =
  | '1h_1d'
  | '1h_1w'
  | '1h_1M'
  // | '4h_3M'
  | '1d_1M'
  | '1d_1Y'
  | '1d_all';

export type DatabarnPricesResponse = DatabarnProductPriceRow[];

export interface IDatabarnApi {
  getInvestorTimeline(address: string): Promise<Array<DatabarnTimelineEntry>>;

  getVaultPrices(
    productType: 'vault' | 'boost',
    priceType: DatabarnPriceType,
    timeBucket: DatabarnTimeBucket,
    address: string,
    chain: string
  ): Promise<DatabarnPricesResponse>;
}
