// todo: load these asynchronously
import { Insurace, Nexus, QiDao } from '../../../helpers/partners';
import { config as chainConfigs } from '../../../config/config';
import { ChainEntity } from '../entities/chain';
import { infoCards } from '../../../config/info-cards';
import {
  BoostConfig,
  ChainConfig,
  FeaturedVaultConfig,
  InfoCardsConfig,
  MinterConfig,
  PartnersConfig,
  PlatformConfig,
  StrategyTypeConfig,
  VaultConfig,
  BeefyZapConfig,
  AmmConfig,
  OneInchZapConfig,
} from './config-types';
import featuredVaults from '../../../config/vault/featured.json';
import boostPartners from '../../../config/boost/partners.json';
import { createGlobLoader } from '../../../helpers/globLoader';

const vaultsLoader = createGlobLoader(
  import.meta.glob<VaultConfig[]>('../../../config/vault/*.json', {
    eager: true,
    import: 'default',
  })
);

const vaultsByChainId: {
  [chainId: ChainEntity['id']]: VaultConfig[];
} = {};
for (const chainId in chainConfigs) {
  let pools = vaultsLoader(chainId);
  /**
   * venus-bnb and venus-wbnb are in fact the same vault
   * this is legacy config and we fix it here
   */
  if (chainId === 'bsc') {
    pools = pools.map(vault => {
      if (vault.id === 'venus-bnb') {
        vault.oracleId = 'BNB';
      }
      return vault;
    });
  }
  vaultsByChainId[chainId] = pools;
}

const boostsLoader = createGlobLoader(
  import.meta.glob<BoostConfig[]>('../../../config/boost/*.json', {
    eager: true,
    import: 'default',
  })
);

const boostsByChainId: {
  [chainId: ChainEntity['id']]: BoostConfig[];
} = {};
for (const chainId in chainConfigs) {
  boostsByChainId[chainId] = boostsLoader(chainId);
  boostsByChainId[chainId].forEach(boost => {
    for (let i = 0; i < boost.partners.length; i++) {
      boost.partners[i] = boostPartners[boost.partners[i] as unknown as string];
    }
  });
}

const ammsLoader = createGlobLoader(
  import.meta.glob<AmmConfig[]>('../../../config/amm/*.json', {
    eager: true,
    import: 'default',
  })
);

const ammsByChainId: {
  [chainId: ChainEntity['id']]: AmmConfig[];
} = {};
for (const chainId in chainConfigs) {
  ammsByChainId[chainId] = ammsLoader(chainId);
}

const mintersLoader = createGlobLoader(
  import.meta.glob<MinterConfig[]>('../../../config/minters/*.tsx', {
    eager: true,
    import: 'minters',
  })
);

const mintersByChainId: {
  [chainId: ChainEntity['id']]: MinterConfig[];
} = {};
for (const chainId in chainConfigs) {
  mintersByChainId[chainId] = mintersLoader(chainId);
}

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
    return featuredVaults;
  }

  public async fetchPartnersConfig(): Promise<PartnersConfig> {
    return { QiDao, Insurace, Nexus };
  }

  public async fetchAmmsConfig(): Promise<{ [chainId: ChainEntity['id']]: AmmConfig[] }> {
    return ammsByChainId;
  }

  public async fetchBeefyZapsConfig(): Promise<BeefyZapConfig[]> {
    return (await import('../../../config/zap/beefy')).zaps;
  }

  public async fetchOneInchZapsConfig(): Promise<OneInchZapConfig[]> {
    return (await import('../../../config/zap/one-inch')).zaps;
  }

  public async fetchAllVaults(): Promise<{ [chainId: ChainEntity['id']]: VaultConfig[] }> {
    return vaultsByChainId;
  }

  public async fetchAllBoosts(): Promise<{ [chainId: ChainEntity['id']]: BoostConfig[] }> {
    return boostsByChainId;
  }

  public async fetchAllMinters(): Promise<{ [chainId: ChainEntity['id']]: MinterConfig[] }> {
    return mintersByChainId;
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
