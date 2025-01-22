import { config as chainConfigs } from '../../../config/config';
import type { ChainEntity } from '../entities/chain';
import type {
  AmmConfig,
  BeefyBridgeConfig,
  BoostCampaignConfig,
  BoostConfig,
  BoostPartnerConfig,
  BridgeConfig,
  ChainConfig,
  MinterConfig,
  PartnersConfig,
  PinnedConfig,
  PlatformConfig,
  PlatformType,
  SwapAggregatorConfig,
  SwapAggregatorConfigLoose,
  VaultConfig,
  ZapConfig,
} from './config-types';
import { mapValues } from 'lodash-es';
import type { MigrationConfig } from '../reducers/wallet/migration';
import { entries, keys } from '../../../helpers/object';
import { getMigratorConfig, getMinterConfig } from '../../../helpers/getConfig';

/**
 * A class to access beefy configuration
 * Access to vaults, boosts, featured items, etc
 */
export class ConfigAPI {
  public async fetchChainConfigs(): Promise<ChainConfig[]> {
    return entries(chainConfigs).map(([id, chain]) => ({ id, ...chain }));
  }

  public async fetchPartnersConfig(): Promise<PartnersConfig> {
    return { ...(await import('../../../helpers/partners')) };
  }

  public async fetchZapAmms(): Promise<{ [chainId in ChainEntity['id']]: AmmConfig[] }> {
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
    // json chain id string isn't automatically narrowed to ChainId
    return (await import('../../../config/beefy-bridge')).beefyBridgeConfig;
  }

  public async fetchZapSwapAggregators(): Promise<SwapAggregatorConfig[]> {
    const config: SwapAggregatorConfigLoose[] = (
      await import('../../../config/zap/swap-aggregators.json')
    ).default; // json types are wide
    return config as SwapAggregatorConfig[];
  }

  public async fetchZapConfigs(): Promise<ZapConfig[]> {
    // json chain id string isn't automatically narrowed to ChainId
    return (await import('../../../config/zap/zaps.json')).default as ZapConfig[];
  }

  public async fetchAllVaults(): Promise<{ [chainId in ChainEntity['id']]: VaultConfig[] }> {
    const vaultsByChainId: { [chainId in ChainEntity['id']]: VaultConfig[] } = Object.fromEntries(
      await Promise.all(
        keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/vault/${chainId}.json`)).default,
        ])
      )
    );

    return mapValues(vaultsByChainId, vaults => vaults.filter(v => !v.hidden));
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
        ...keys(chainConfigs).map(async chainId => import(`../../../config/boost/${chainId}.json`)),
      ])
    ).map(i => i.default);

    const boosts: Record<ChainEntity['id'], BoostConfig[]> = Object.fromEntries(
      await Promise.all(keys(chainConfigs).map(async (chainId, i) => [chainId, boostsPerChain[i]]))
    );

    const boostsByChainId = mapValues(boosts, boosts =>
      boosts
        .map(boost => ({
          ...boost,
          partners: (boost.partners || []).filter(id => !!partnersById[id]),
          campaign: boost.campaign && campaignsById[boost.campaign] ? boost.campaign : undefined,
        }))
        .filter(b => !b.hidden)
    );

    return { boostsByChainId, partnersById, campaignsById };
  }

  public async fetchAllMinters(): Promise<{ [chainId in ChainEntity['id']]?: MinterConfig[] }> {
    const entries = await Promise.all(
      keys(chainConfigs).map(async chainId => {
        const minters = await getMinterConfig(chainId);
        return [chainId, minters || []];
      })
    );

    return Object.fromEntries(entries.filter(entry => entry !== undefined));
  }

  public async fetchAllMigrators(): Promise<{
    [chainId in ChainEntity['id']]?: MigrationConfig[];
  }> {
    const entries = await Promise.all(
      keys(chainConfigs).map(async chainId => {
        const migrators = await getMigratorConfig(chainId);
        return [chainId, migrators || []];
      })
    );

    return Object.fromEntries(entries.filter(entry => entry !== undefined));
  }

  public async fetchPlatforms(): Promise<PlatformConfig[]> {
    const platforms = (await import('../../../config/platforms.json')).default;
    return platforms.map(platform => ({
      ...platform,
      type: platform.type as PlatformType | undefined,
    }));
  }

  public async fetchBridges(): Promise<BridgeConfig[]> {
    return (await import('../../../config/bridges.json')).default;
  }

  public async fetchPinnedConfig(): Promise<PinnedConfig[]> {
    return (await import('../../../config/pinned.json')).default as PinnedConfig[];
  }
}
