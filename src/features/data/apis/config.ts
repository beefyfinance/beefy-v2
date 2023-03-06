import { config as chainConfigs } from '../../../config/config';
import { Insurace, Nexus, QiDao } from '../../../helpers/partners';
import type { ChainEntity } from '../entities/chain';
import { infoCards } from '../../../config/info-cards';
import type {
  AmmConfig,
  BeefyZapConfig,
  BoostConfig,
  ChainConfig,
  FeaturedVaultConfig,
  InfoCardsConfig,
  MinterConfig,
  OneInchZapConfig,
  PartnersConfig,
  PlatformConfig,
  StrategyTypeConfig,
  VaultConfig,
} from './config-types';

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
    return { QiDao, Insurace, Nexus };
  }

  public async fetchAmmsConfig(): Promise<{ [chainId: ChainEntity['id']]: AmmConfig[] }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/amm/${chainId}.json`)).default,
        ])
      )
    );
  }

  public async fetchBeefyZapsConfig(): Promise<BeefyZapConfig[]> {
    return (await import('../../../config/zap/beefy')).zaps;
  }

  public async fetchOneInchZapsConfig(): Promise<OneInchZapConfig[]> {
    return (await import('../../../config/zap/one-inch')).zaps;
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

  public async fetchAllBoosts(): Promise<{ [chainId: ChainEntity['id']]: BoostConfig[] }> {
    return Object.fromEntries(
      await Promise.all(
        Object.keys(chainConfigs).map(async chainId => [
          chainId,
          (await import(`../../../config/boost/${chainId}.json`)).default,
        ])
      )
    );
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

  public async fetchAllInfoCards(): Promise<InfoCardsConfig> {
    return infoCards;
  }

  public async fetchStrategyTypes(): Promise<StrategyTypeConfig[]> {
    return (await import('../../../config/strategy-types.json')).default;
  }

  public async fetchPlatforms(): Promise<PlatformConfig[]> {
    return (await import('../../../config/platforms.json')).default;
  }
}
