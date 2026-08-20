import type { PromoCampaignConfig, PromoPartnerConfig, PinnedConfig, PromoConfig } from './types';
import type { ChainEntity } from '../../entities/chain';
export declare class PromosApi {
    fetchAllPromos(): Promise<{
        chainId: ChainEntity["id"];
        promos: PromoConfig[];
    }[]>;
    fetchPromosByChainId(chainId: string): Promise<PromoConfig[]>;
    fetchPromosForChains(chainIds: string[]): Promise<{
        chainId: ChainEntity["id"];
        promos: PromoConfig[];
    }[]>;
    fetchPartners(): Promise<Record<string, PromoPartnerConfig>>;
    fetchCampaigns(): Promise<Record<string, PromoCampaignConfig>>;
    fetchPinned(): Promise<PinnedConfig[]>;
}
