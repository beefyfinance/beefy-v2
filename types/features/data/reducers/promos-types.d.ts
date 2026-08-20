import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types';
import type { BoostContractData, GovVaultMultiContractData } from '../apis/contract-data/contract-data-types';
import type { PinnedConfig } from '../apis/promos/types';
import type { ChainEntity } from '../entities/chain';
import type { BoostPromoEntity, PromoCampaignEntity, PromoEntity, PromoPartnerEntity } from '../entities/promo';
import type { VaultEntity, VaultGov } from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
export type OffchainRewardData = Pick<BeefyOffChainRewardsCampaign, 'startTimestamp' | 'endTimestamp' | 'rewardToken' | 'type'> & {
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
    byChainId: {
        [chainId in ChainEntity['id']]?: {
            allIds: PromoEntity['id'][];
            byContractAddress: {
                [contractAddress: string]: PromoEntity['id'];
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
