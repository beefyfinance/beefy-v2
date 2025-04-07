import { config as chainConfigs } from '../../../config/config.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type {
  AmmConfig,
  BeefyBridgeConfig,
  BridgeConfig,
  ChainConfig,
  MinterConfig,
  PartnersConfig,
  PlatformConfig,
  PlatformType,
  SwapAggregatorConfig,
  SwapAggregatorConfigLoose,
  VaultConfig,
  ZapConfig,
} from './config-types.ts';
import { mapValues } from 'lodash-es';
import type { MigrationConfig } from '../reducers/wallet/migration.ts';
import { entries, keys } from '../../../helpers/object.ts';
import { getMigratorConfig, getMinterConfig } from '../../../helpers/getConfig.ts';
import { featureFlag_sonicTestnet } from '../utils/feature-flags.ts';

/**
 * A class to access beefy configuration
 * Access to vaults, boosts, featured items, etc
 */
export class ConfigAPI {
  public async fetchChainConfigs(): Promise<ChainConfig[]> {
    const configs = entries(chainConfigs).map(([id, chain]) => ({ id, ...chain }));

    // TODO beSonic remove
    const sonicTestnet = featureFlag_sonicTestnet();
    if (sonicTestnet) {
      const chain = configs.find(c => c.id === 'sonic');
      if (chain) {
        for (const [key, value] of Object.entries(sonicTestnet.chain)) {
          (chain as unknown as Record<typeof key, typeof value>)[key] = value;
        }
      }
    }

    return configs;
  }

  public async fetchPartnersConfig(): Promise<PartnersConfig> {
    return { ...(await import('../../../helpers/partners.ts')) };
  }

  public async fetchZapAmms(): Promise<{
    [chainId in ChainEntity['id']]: AmmConfig[];
  }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/zap/amm/${chainId}.json`)).default as AmmConfig[],
        ])
      )
    ) as {
      [chainId in ChainEntity['id']]: AmmConfig[];
    };
  }

  public async fetchBeefyBridgeConfig(): Promise<BeefyBridgeConfig> {
    // json chain id string isn't automatically narrowed to ChainId
    return (await import('../../../config/beefy-bridge.ts')).beefyBridgeConfig;
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

  public async fetchAllVaults(): Promise<{
    [chainId in ChainEntity['id']]: VaultConfig[];
  }> {
    const vaultsByChainId: {
      [chainId in ChainEntity['id']]: VaultConfig[];
    } = Object.fromEntries(
      await Promise.all(
        keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/vault/${chainId}.json`)).default as VaultConfig[],
        ])
      )
    );

    // TODO beSonic remove
    const sonicTestnet = featureFlag_sonicTestnet();
    if (sonicTestnet) {
      const vault = vaultsByChainId['sonic']?.find(v => v.id === 'beefy-besonic');
      if (vault) {
        for (const [key, value] of Object.entries(sonicTestnet.vault)) {
          (vault as unknown as Record<typeof key, typeof value>)[key] = value;
        }
      }
    }

    return mapValues(vaultsByChainId, vaults => vaults.filter(v => !v.hidden));
  }

  public async fetchAllMinters(): Promise<{ [chainId in ChainEntity['id']]?: MinterConfig[] }> {
    const entries = await Promise.all(
      keys(chainConfigs).map(async chainId => {
        const minters = await getMinterConfig(chainId);
        return [chainId, minters || []];
      })
    );

    return Object.fromEntries(entries.filter(entry => entry !== undefined)) as {
      [chainId in ChainEntity['id']]?: MinterConfig[];
    };
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

    return Object.fromEntries(entries.filter(entry => entry !== undefined)) as {
      [chainId in ChainEntity['id']]?: MigrationConfig[];
    };
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
}
