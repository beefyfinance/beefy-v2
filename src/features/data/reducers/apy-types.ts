// boost is expressed as APR
import type { ApiApyData } from '../apis/beefy/beefy-api-types.ts';
import type { BoostPromoEntity } from '../entities/promo.ts';
import type { VaultEntity } from '../entities/vault.ts';

export interface BoostAprData {
  apr: number; //total Boost APR
  aprByRewardToken: Array<{
    rewardToken: string;
    apr: number;
  }>;
}

// TODO: this should be reworked
export interface TotalApy {
  totalApy: number;
  totalType: 'apy' | 'apr';
  totalMonthly: number;
  totalDaily: number;
  vaultApr?: number;
  vaultDaily?: number;
  tradingApr?: number;
  tradingDaily?: number;
  composablePoolApr?: number;
  composablePoolDaily?: number;
  liquidStakingApr?: number;
  liquidStakingDaily?: number;
  boostApr?: number;
  boostDaily?: number;
  boostedTotalApy?: number;
  boostedTotalDaily?: number;
  clmApr?: number;
  clmDaily?: number;
  merklApr?: number;
  merklDaily?: number;
  stellaSwapApr?: number;
  stellaSwapDaily?: number;
  rewardPoolApr?: number;
  rewardPoolDaily?: number;
  rewardPoolTradingApr?: number;
  rewardPoolTradingDaily?: number;
  merklBoostApr?: number;
  merklBoostDaily?: number;
}

type ExtractAprComponents<T extends string> = T extends `${infer C}Apr` ? C : never;
export type TotalApyKey = Exclude<keyof TotalApy, 'totalType'>;
export type TotalApyComponent = ExtractAprComponents<TotalApyKey>;
export type TotalApyYearlyComponent = `${TotalApyComponent}Apr`;
export type TotalApyDailyComponent = `${TotalApyComponent}Daily`;

export interface RawAvgApy {
  periods: Array<{ days: number; apy: number }>;
}

export type AvgApyPeriod = {
  days: number;
  /* ceil(min(days,age)) */
  dataDays: number;
  value: number;
  partial: boolean;
  full: boolean;
};

export type AvgApy = {
  periods: Record<number, AvgApyPeriod>;
  partial: number[];
  full: number[];
};

export type RawAprByBoostId = {
  [boostId: BoostPromoEntity['id']]: BoostAprData;
};

export type ApyContractState = {
  rawApyByBoostId: RawAprByBoostId;
};

/**
 * State containing APY infos indexed by vault id
 */
export interface ApyState {
  rawApy: {
    byVaultId: {
      // we reuse the api types, not the best idea but works for now
      [vaultId: VaultEntity['id']]: ApiApyData;
    };
    byBoostId: RawAprByBoostId;
  };
  totalApy: {
    byVaultId: {
      // we reuse the api types, not the best idea but works for now
      [vaultId: VaultEntity['id']]: TotalApy;
    };
  };
  rawAvgApy: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: RawAvgApy;
    };
  };
  avgApy: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: AvgApy;
    };
  };
}
