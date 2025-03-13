import type {
  PromoCampaignConfig,
  PromoPartnerConfig,
  PinnedConfig,
  PromoConfig,
} from './types.ts';
import { extractChainId } from './utils.ts';
import type { ChainEntity } from '../../entities/chain.ts';

const chainPathToImportFn = import.meta.glob<PromoConfig[]>(
  '../../../../config/promos/chain/*.json',
  {
    import: 'default',
  }
);

export class PromosApi {
  async fetchAllPromos() {
    const chains = Object.keys(chainPathToImportFn).map(extractChainId);
    return this.fetchPromosForChains(chains);
  }

  async fetchPromosByChainId(chainId: string) {
    const importFn = chainPathToImportFn[`../../../../config/promos/chain/${chainId}.json`];
    if (!importFn) {
      console.warn(`No promos found for chain ${chainId}`);
      return [];
    }
    return importFn();
  }

  async fetchPromosForChains(chainIds: string[]) {
    return await Promise.all(
      chainIds.map(async chainId => ({
        chainId: chainId as ChainEntity['id'],
        promos: await this.fetchPromosByChainId(chainId),
      }))
    );
  }

  async fetchPartners() {
    return (await import('../../../../config/promos/partners.json')).default as Record<
      string,
      PromoPartnerConfig
    >;
  }

  async fetchCampaigns() {
    return (await import('../../../../config/promos/campaigns.json')).default as Record<
      string,
      PromoCampaignConfig
    >;
  }

  public async fetchPinned(): Promise<PinnedConfig[]> {
    return (await import('../../../../config/promos/pinned.json')).default as PinnedConfig[];
  }
}
