import type { ChainEntity } from '../../entities/chain.ts';

export type PinnedConfigConditionTime = {
  type: 'time';
  from?: number;
  to?: number;
};

export type PinnedConfigConditionBoosted = {
  type: 'boosted';
  /** default: anything with boostedTotalDaily > 0 */
  only?: 'contract' | 'offchain';
};

export type PinnedConfigCondition = PinnedConfigConditionTime | PinnedConfigConditionBoosted;

export type PinnedConfig = {
  /** vault id, or array of vault ids, undefined = all vaults */
  id?: string | string[];
  /** all conditions must match, or only one of them [default: all] */
  mode?: 'all' | 'any';
  /** conditions to match according to mode, undefined = match */
  conditions?: Array<PinnedConfigCondition>;
  /** limit the results from thsi config to this many vaults */
  limit?: number;
  /** period for random limiting, default 6 hours */
  period?: number;
};

export type PromoTokenRewardConfig = {
  type: 'token';
  address: string;
  symbol: string;
  decimals: number;
  oracleId: string;
  oracle?: 'lps' | 'tokens';
  chainId?: ChainEntity['id'];
};

/*type PromoPointsRewardConfig = {
  type: 'points';
  name: string;
};*/

export type PromoRewardConfig = PromoTokenRewardConfig /*| PromoPointsRewardConfig*/;

type PromoTagConfig = { text?: string; icon?: string };

export type BasePromoConfig = {
  id: string;
  title: string;
  /** defaults to title */
  by?: string;
  vaultId: string;
  /** @deprecated use vaultId to retrieve from vault entity */
  assets?: string[];
  /** @deprecated use vaultId to retrieve from vault entity */
  tokenAddress?: string;
  tag?: {
    /** defaults to title */
    text?: string;
    /** default depending on type */
    icon?: string;
  };
  /** inactive before this time, `status` after */
  startTime?: number;
  /** `status` before this time, inactive after */
  endTime?: number;
  /** status, default inactive, can be overriden by start/endTime or type-specific logic (e.g. contract end time)  */
  status?: 'active' | 'prestake' | 'inactive';
  /** what the rewards are */
  rewards: PromoRewardConfig[];
  /** partners to show info box for */
  partners?: string[];
  /** campaign to show text/links from */
  campaign?: string;
};

type MakePromo<T> = BasePromoConfig & T;

export type BoostPromoConfig = MakePromo<{
  /** boost of vault via boost (v1) / reward pool (v2+) contract */
  type: 'boost';
  /** address of the boost contract */
  contractAddress: string;
  /** version of the boost contract 1 = boost 2 = reward pool */
  version?: number;
}>;

export type OffChainPromoConfig = MakePromo<{
  /** boost of vault via extra off chain merkl/stellaswap rewards */
  type: 'offchain';
  /** which `type` from our offchain api should this apply to */
  campaignType: string;
}>;

export type PoolPromoConfig = MakePromo<{
  /** boost of clm pool via extra rewards */
  type: 'pool';
}>;

export type AirdropPromoConfig = MakePromo<{
  /** boost of vault via airdrop */
  type: 'airdrop';
}>;

export type PromoConfig =
  | BoostPromoConfig
  | OffChainPromoConfig
  | PoolPromoConfig
  | AirdropPromoConfig;

export type PromoSocials = {
  telegram?: string;
  twitter?: string;
  discord?: string;
};

export interface PromoPartnerConfig {
  title: string;
  text: string;
  website: string;
  social: PromoSocials;
}

export interface PromoCampaignConfig {
  title: string;
  description: string;
  learn?: string;
  social: PromoSocials;
  /** Replace promo tag with this tag if this campaign is assigned to the promo */
  tag?: PromoTagConfig;
}
