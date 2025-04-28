import type { Override } from '../utils/types-utils.ts';
import type {
  AirdropPromoConfig,
  BoostPromoConfig,
  OffChainPromoConfig,
  PoolPromoConfig,
  PromoCampaignConfig,
  PromoPartnerConfig,
  PromoTokenRewardConfig,
} from '../apis/promos/types.ts';
import type { ChainEntity } from './chain.ts';

export type PromoTokenReward = Override<
  PromoTokenRewardConfig,
  {
    chainId: ChainEntity['id'];
    oracle: 'lps' | 'tokens';
  }
>;

export type PromoReward = PromoTokenReward;

type BasePromoOverrides = {
  by: string;
  tag: { text: string; icon: string | undefined };
  chainId: ChainEntity['id'];
  rewards: PromoReward[];
  status: 'active' | 'prestake' | 'inactive';
};

export type BoostPromoEntity = Override<
  BoostPromoConfig,
  BasePromoOverrides & {
    version: number;
  }
>;

export type OffChainPromoEntity = Override<OffChainPromoConfig, BasePromoOverrides>;
export type PoolPromoEntity = Override<PoolPromoConfig, BasePromoOverrides>;
export type AirdropPromoEntity = Override<AirdropPromoConfig, BasePromoOverrides>;

export type PromoEntity =
  | BoostPromoEntity
  | OffChainPromoEntity
  | PoolPromoEntity
  | AirdropPromoEntity;

export type PromoPartnerEntity = PromoPartnerConfig & { id: string };

export type PromoCampaignEntity = PromoCampaignConfig & {
  id: string;
  tag: { text: string | undefined; icon: string | undefined };
};
