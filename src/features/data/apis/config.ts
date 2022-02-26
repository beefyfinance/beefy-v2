// todo: load these asynchronously
import { QiDao, Insurace, Moonpot, LaCucina } from '../../../helpers/partners';
import { featuredPools as featuredVaults } from '../../../config/vault/featured';

import { config as chainConfigs } from '../../../config/config';

import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { PlatformEntity } from '../entities/platform';
import { VaultEntity } from '../entities/vault';

// generated from config data with https://jvilk.com/MakeTypes/
export interface VaultConfig {
  id: string;
  logo?: string | null;
  name: string;
  token: string;
  tokenDescription: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenDescriptionUrl?: string | null;
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number | null;
  earnContractAddress: string;
  pricePerFullShare: number;
  tvl: number;
  oraclePrice?: number | null; // pulled afterward
  oracle: string; // 'tokens' | 'lp';
  oracleId: TokenEntity['id'];
  status: string; // 'active' | 'eol' | 'paused';
  platform: PlatformEntity['id'];
  assets?: TokenEntity['id'][];
  risks?: string[] | null;
  stratType: string; // 'StratLP' | 'StratMultiLP' | 'Vamp' | 'Lending' | 'SingleStake' | 'Maxi';
  withdrawalFee?: string | null;
  network: string;
  poolAddress?: string | null;
  excluded?: string | null;
  isGovVault?: boolean | null;
  callFee?: number | null;
  createdAt?: number | null;
  addLiquidityUrl?: string | null;
  buyTokenUrl?: string | null;
  retireReason?: string | null;
  removeLiquidityUrl?: string | null;
  depositFee?: string | null;
  refund?: boolean | null;
  refundContractAddress?: string | null;
  depositsPaused?: boolean | null;
  showWarning?: boolean | null;
  warning?: string | null;
}

export interface FeaturedVaultConfig {
  [vaultId: VaultEntity['id']]: boolean;
}

export interface MoonpotConfig {
  id: VaultEntity['id'];
  img: string;
  link: string;
}
export interface PartnersConfig {
  QiDao: VaultEntity['id'][];
  Insurace: ChainEntity['id'][];
  Moonpot: MoonpotConfig[];
  LaCucina: VaultEntity['id'][];
}

interface BoostPartnerConfig {
  logo: string;
  background: string;
  text: string;
  website: string;
  social: {
    telegram: string;
    twitter: string;
    discord?: string | null;
  };
  logoNight?: string | null;
}
export interface BoostConfig {
  id: string;
  poolId: string;
  name: string;
  assets?: string[] | null;
  earnedToken: string;
  earnedTokenDecimals: number;
  earnedTokenAddress: string;
  earnContractAddress: string;
  earnedOracle: string;
  earnedOracleId: string;
  partnership: boolean;
  status: string;
  isMooStaked: boolean;
  partners?: BoostPartnerConfig[] | null;
  logo?: string | null;
  fixedStatus?: boolean | null;
}

export interface ChainConfig {
  id: string;
  name: string;
  chainId: number;
  rpc: string[];
  explorerUrl: string;
  multicallAddress: string;
  fetchContractDataAddress?: string;
  fetchBalancesAddress?: string;
  supportedWallets: string[];
  providerName: string;
  walletSettings: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
  stableCoins: string[];
}

export interface ZapConfig {
  zapAddress: string; // identifier
  ammRouter: string;
  ammFactory: string;
  ammPairInitHash: string;
}

const vaultsByChainId: {
  [chainId: ChainEntity['id']]: VaultConfig[];
} = {};
for (const chainId in chainConfigs) {
  let pools = require(`../../../config/vault/${chainId}`).pools;
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

const boostsByChainId: {
  [chainId: ChainEntity['id']]: BoostConfig[];
} = {};
for (const chainId in chainConfigs) {
  boostsByChainId[chainId] = require(`../../../config/boost/${chainId}`).pools;
}

const zapsByChainId: {
  [chainId: ChainEntity['id']]: ZapConfig[];
} = {};
for (const chainId in chainConfigs) {
  zapsByChainId[chainId] = require(`../../../config/zap/${chainId}`).zaps;
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
    return { QiDao, Insurace, Moonpot, LaCucina };
  }

  public async fetchZapsConfig(): Promise<{ [chainId: ChainEntity['id']]: ZapConfig[] }> {
    return zapsByChainId;
  }

  public async fetchAllVaults(): Promise<{ [chainId: ChainEntity['id']]: VaultConfig[] }> {
    return vaultsByChainId;
  }

  public async fetchAllBoosts(): Promise<{ [chainId: ChainEntity['id']]: BoostConfig[] }> {
    return boostsByChainId;
  }
}
