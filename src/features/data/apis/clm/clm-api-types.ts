import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain.ts';
import type { VaultEntity } from '../../entities/vault.ts';

export type ApiClmHarvestRow = {
  id: string;
  type: 'clm';
  timestamp: string;
  compoundedAmount0: string;
  compoundedAmount1: string;
  token0ToUsd: string;
  token1ToUsd: string;
  totalAmount0: string;
  totalAmount1: string;
  totalSupply: string;
};

export type ApiClassicHarvestRow = {
  id: string;
  type: 'classic';
  timestamp: string;
  compoundedAmount: string;
  underlyingToUsd: string;
  totalUnderlying: string;
  totalSupply: string;
};

export type ClmVaultHarvestsResponse = ApiClmHarvestRow[] | ApiClassicHarvestRow[];

export type ClmVaultsHarvestsResponse = {
  vaultAddress: string;
  harvests: ApiClmHarvestRow[] | ApiClassicHarvestRow[];
}[];

export type ClmPendingRewardsResponse = {
  fees0: BigNumber;
  fees1: BigNumber;
  totalSupply: BigNumber;
};

export type TimelineActionClm =
  | 'MANAGER_DEPOSIT'
  | 'MANAGER_WITHDRAW'
  | 'CLM_REWARD_POOL_STAKE'
  | 'CLM_REWARD_POOL_UNSTAKE'
  | 'CLM_REWARD_POOL_CLAIM';

export type TimelineActionClassic =
  | 'VAULT_DEPOSIT'
  | 'VAULT_WITHDRAW'
  | 'CLASSIC_REWARD_POOL_STAKE'
  | 'CLASSIC_REWARD_POOL_UNSTAKE'
  | 'CLASSIC_REWARD_POOL_CLAIM';

export type ClmTimelineEntryClm = {
  chain: ChainEntity['id'];
  datetime: string;
  display_name: string;
  is_dashboard_eol: boolean;
  is_eol: boolean;
  product_key: string;
  type: 'clm';
  transaction_hash: string;

  /** total clm + reward pool balance */
  share_balance: string;
  share_diff: string;

  token0_to_usd: string;
  underlying0_balance: string;
  underlying0_diff: string;

  token1_to_usd: string;
  underlying1_balance: string;
  underlying1_diff: string;

  usd_balance: string;
  usd_diff: string;

  /** balance of the clm receipt token */
  manager_balance: string;
  manager_diff: string;
  manager_address: string;

  /** total balance/diff of all reward pools */
  reward_pool_total: {
    reward_pool_balance: string | null;
    reward_pool_diff: string | null;
  } | null;

  /** address/balance/diff for each reward pool */
  reward_pool_details: Array<{
    reward_pool_address: string;
    reward_pool_balance: string;
    reward_pool_diff: string;
  }> | null;

  /** amounts claimed from reward pool */
  reward_pool_claim_details: Array<{
    reward_address: string;
    reward_to_usd: string;
    claimed_amount: string;
  }>;

  /** reward pool from where rewards were claimed */
  claimed_reward_pool: string | undefined;

  actions: TimelineActionClm[];
};

export type ClmTimelineEntryClassic = {
  chain: ChainEntity['id'];
  datetime: string;
  display_name: string;
  is_dashboard_eol: boolean;
  is_eol: boolean;
  product_key: string;
  type: 'classic';
  transaction_hash: string;

  /** total vault + reward pool balance in shares */
  share_balance: string;
  share_diff: string;
  share_to_underlying: string;

  underlying_address: string;
  underlying_to_usd: string;

  underlying_breakdown: Array<{
    token: string;
    underlying_to_token: string;
    token_to_usd: string;
  }>;

  usd_balance: string;
  usd_diff: string;

  /** vault balance in shares */
  vault_balance: string;
  vault_diff: string;
  vault_address: string;

  /** total balance/diff of all reward pools in shares */
  reward_pool_total: {
    reward_pool_balance: string | null;
    reward_pool_diff: string | null;
  } | null;

  /** address/balance/diff for each reward pool in shares */
  reward_pool_details: Array<{
    reward_pool_address: string;
    reward_pool_balance: string;
    reward_pool_diff: string;
  }> | null;

  actions: TimelineActionClassic[];
};

export type ClmTimelineEntry = ClmTimelineEntryClm | ClmTimelineEntryClassic;

export type ClmInvestorTimelineResponse = ClmTimelineEntry[];

export type ClmPeriod = '1h' | '1d';

export type ClmPriceHistoryEntryClm = {
  type: 'clm';
  timestamp: number;
  rangeMin: string;
  currentPrice: string;
  rangeMax: string;
  token0ToUsd: string;
  token1ToUsd: string;
  totalAmount0: string;
  totalAmount1: string;
  totalSupply: string;
};

export type ClmPriceHistoryEntryClassic = {
  type: 'classic';
  timestamp: number;
  underlyingToUsd: string;
  totalUnderlyingAmount: string;
  totalSupply: string;
  totalUnderlyingSupply: string;
  totalUnderlyingBreakdown: Array<{
    token: string;
    amount: string;
    priceUsd: string;
  }>;
};

export type ClmPriceHistoryEntry = ClmPriceHistoryEntryClm | ClmPriceHistoryEntryClassic;

export type ClmPriceHistoryResponse = ClmPriceHistoryEntry[];

export interface IClmApi {
  getHarvestsForVault(
    chainId: ChainEntity['id'],
    vaultAddress: VaultEntity['contractAddress']
  ): Promise<ClmVaultHarvestsResponse>;

  getHarvestsForVaultsSince(
    chainId: ChainEntity['id'],
    vaultAddresses: VaultEntity['contractAddress'][],
    since: Date
  ): Promise<ClmVaultsHarvestsResponse>;

  getClmPendingRewards(
    chain: ChainEntity,
    stratAddress: string,
    vaultAddress: VaultEntity['contractAddress']
  ): Promise<ClmPendingRewardsResponse>;

  getPriceHistoryForVaultSince<T extends ClmPriceHistoryEntry>(
    chainId: ChainEntity['id'],
    vaultAddress: VaultEntity['contractAddress'],
    since: Date,
    period: ClmPeriod
  ): Promise<T[]>;

  getInvestorTimeline(address: string): Promise<ClmInvestorTimelineResponse>;
}
