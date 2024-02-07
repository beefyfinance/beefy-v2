import { config as chainConfigs } from '../../../config/config';
import { Nexus, QiDao, OpenCover } from '../../../helpers/partners';
import type { ChainEntity } from '../entities/chain';
import type {
  AmmConfig,
  BeefyBridgeConfig,
  BoostCampaignConfig,
  BoostConfig,
  BoostPartnerConfig,
  BridgeConfig,
  ChainConfig,
  FeaturedVaultConfig,
  MinterConfig,
  PartnersConfig,
  PlatformConfig,
  SwapAggregatorConfig,
  SwapAggregatorConfigLoose,
  VaultConfig,
  ZapConfig,
} from './config-types';
import { mapValues } from 'lodash-es';
import type { MigrationConfig } from '../reducers/wallet/migration';

/**
 * A class to access beefy configuration
 * Access to vaults, boosts, featured items, etc
 */
export class ConfigAPI {
  public async fetchChainConfigs(): Promise<ChainConfig[]> {
    return Object.entries(chainConfigs).map(([id, chain]) => ({ id, ...chain }));
  }

  public async fetchFeaturedVaults(): Promise<FeaturedVaultConfig> {
    return (await import('../../../config/vault/featured.json')).default;
  }

  public async fetchPartnersConfig(): Promise<PartnersConfig> {
    return { QiDao, OpenCover, Nexus };
  }

  public async fetchZapAmms(): Promise<{ [chainId: ChainEntity['id']]: AmmConfig[] }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/zap/amm/${chainId}.json`)).default,
        ])
      )
    );
  }

  public async fetchBeefyBridgeConfig(): Promise<BeefyBridgeConfig> {
    return (await import('../../../config/beefy-bridge')).beefyBridgeConfig;
  }

  public async fetchZapSwapAggregators(): Promise<SwapAggregatorConfig[]> {
    const config: SwapAggregatorConfigLoose[] = (
      await import('../../../config/zap/swap-aggregators.json')
    ).default; // json types are wide
    return config as SwapAggregatorConfig[];
  }

  public async fetchZapConfigs(): Promise<ZapConfig[]> {
    return (await import('../../../config/zap/zaps.json')).default;
  }

  public async fetchAllVaults(): Promise<{ [chainId: ChainEntity['id']]: VaultConfig[] }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/vault/${chainId}.json`)).default,
        ])
      )
    );
  }

  public async fetchAllBoosts(): Promise<{
    boostsByChainId: Record<ChainEntity['id'], BoostConfig[]>;
    partnersById: Record<string, BoostPartnerConfig>;
    campaignsById: Record<string, BoostCampaignConfig>;
  }> {
    const [partnersById, campaignsById, ...boostsPerChain] = (
      await Promise.all([
        import(`../../../config/boost/partners.json`),
        import(`../../../config/boost/campaigns.json`),
        ...Object.keys(chainConfigs).map(
          async chainId => import(`../../../config/boost/${chainId}.json`)
        ),
      ])
    ).map(i => i.default);

    const boosts = Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async (chainId, i) => [chainId, boostsPerChain[i]])
      )
    );

    const boostsByChainId = mapValues(boosts, boosts =>
      boosts.map(boost => ({
        ...boost,
        partners: (boost.partners || []).filter(id => !!partnersById[id]),
        campaign: boost.campaign && campaignsById[boost.campaign] ? boost.campaign : undefined,
      }))
    );

    return { boostsByChainId, partnersById, campaignsById };
  }

  public async fetchAllMinters(): Promise<{ [chainId: ChainEntity['id']]: MinterConfig[] }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/minters/${chainId}.tsx`)).minters,
        ])
      )
    );
  }

  public async fetchAllMigrators(): Promise<{
    [chainId: ChainEntity['id']]: MigrationConfig[];
  }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/migrators/${chainId}.tsx`)).migrators,
        ])
      )
    );
  }

  public async fetchPlatforms(): Promise<PlatformConfig[]> {
    return (await import('../../../config/platforms.json')).default;
  }

  public async fetchBridges(): Promise<BridgeConfig[]> {
    return (await import('../../../config/bridges.json')).default;
  }
}
