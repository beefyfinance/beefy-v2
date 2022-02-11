import {
  BoostConfig,
  ChainConfig,
  FeaturedVaultConfig,
  PartnersConfig,
  VaultConfig,
} from '../../../config/all-config';
import { config as chainConfigs } from '../../../config/config';
import { ChainEntity } from '../entities/chain';

/**
 * A class to access beefy configuration
 * Access to vaults, boosts, featured items, etc
 * TODO: this class loads unnecessary data from the start of the app. Make it so only required data is fetched
 */
export class ConfigAPI {
  public async fetchChainConfigs(): Promise<ChainConfig[]> {
    return Object.entries(chainConfigs).map(([id, chain]) => ({ id, ...chain }));
  }

  public async fetchFeaturedVaults(): Promise<FeaturedVaultConfig> {
    const {
      configs: { featuredVaults },
    } = await import('../../../config/all-config');
    return featuredVaults;
  }
  public async fetchPartnersConfig(): Promise<PartnersConfig> {
    const {
      configs: { partners },
    } = await import('../../../config/all-config');
    return partners;
  }

  public async fetchAllVaults(): Promise<{ [chainId: ChainEntity['id']]: VaultConfig[] }> {
    const {
      configs: { vaultsByChainId },
    } = await import('../../../config/all-config');
    return vaultsByChainId;
  }

  public async fetchAllBoosts(): Promise<{ [chainId: ChainEntity['id']]: BoostConfig[] }> {
    const {
      configs: { boostsByChainId },
    } = await import('../../../config/all-config');
    return boostsByChainId;
  }
}
