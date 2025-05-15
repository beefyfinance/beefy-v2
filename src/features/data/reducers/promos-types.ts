import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types.ts';
import type {
  BoostContractData,
  GovVaultMultiContractData,
} from '../apis/contract-data/contract-data-types.ts';
import type { PinnedConfig } from '../apis/promos/types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type {
  BoostPromoEntity,
  PromoCampaignEntity,
  PromoEntity,
  PromoPartnerEntity,
} from '../entities/promo.ts';
import type { VaultEntity, VaultGov } from '../entities/vault.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';

export type OffchainRewardData = Pick<
  BeefyOffChainRewardsCampaign,
  'startTimestamp' | 'endTimestamp' | 'rewardToken' | 'type'
> & {
  apr: number;
};
export type PromosState = NormalizedEntity<PromoEntity> & {
  byVaultId: {
    [vaultId: VaultEntity['id']]: {
      allIds: PromoEntity['id'][];
      byType: {
        [promoType in PromoEntity['type']]?: {
          allIds: PromoEntity['id'][];
        };
      };
    };
  };
  byType: {
    [promoType in PromoEntity['type']]?: {
      allIds: PromoEntity['id'][];
      byChainId: {
        [chainId in ChainEntity['id']]?: {
          allIds: PromoEntity['id'][];
        };
      };
    };
  };
  partners: {
    allIds: PromoPartnerEntity['id'][];
    byId: Record<PromoPartnerEntity['id'], PromoPartnerEntity>;
  };
  campaigns: {
    allIds: PromoCampaignEntity['id'][];
    byId: Record<PromoCampaignEntity['id'], PromoCampaignEntity>;
  };
  dataByType: {
    boost: {
      [boostId: BoostPromoEntity['id']]: BoostContractData;
    };
    pool: {
      [vaultId: VaultGov['id']]: GovVaultMultiContractData;
    };
    offchain: {
      [vaultId: VaultEntity['id']]: OffchainRewardData[];
    };
  };
  statusById: {
    [promoId: PromoEntity['id']]: 'active' | 'prestake' | 'inactive';
  };
  pinned: {
    configs: PinnedConfig[];
    byId: {
      [vaultId: VaultEntity['id']]: boolean;
    };
  };
};
