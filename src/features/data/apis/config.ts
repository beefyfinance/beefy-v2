// todo: load these asynchronously
import { featuredPools as featuredVaults } from '../../../config/vault/featured';
import { pools as arbitrumVaults } from '../../../config/vault/arbitrum';
import { pools as avaxVaults } from '../../../config/vault/avax';
import { pools as bscVaults } from '../../../config/vault/bsc';
import { pools as celoVaults } from '../../../config/vault/celo';
import { pools as cronosVaults } from '../../../config/vault/cronos';
import { pools as fantomVaults } from '../../../config/vault/fantom';
import { pools as fuseVaults } from '../../../config/vault/fuse';
import { pools as harmonyVaults } from '../../../config/vault/harmony';
import { pools as hecoVaults } from '../../../config/vault/heco';
import { pools as metisVaults } from '../../../config/vault/metis';
import { pools as moonriverVaults } from '../../../config/vault/moonriver';
import { pools as polygonVaults } from '../../../config/vault/polygon';
import { pools as arbitrumBoosts } from '../../../config/boost/arbitrum';
import { pools as avaxBoosts } from '../../../config/boost/avax';
import { pools as bscBoosts } from '../../../config/boost/bsc';
import { pools as celoBoosts } from '../../../config/boost/celo';
import { pools as cronosBoosts } from '../../../config/boost/cronos';
import { pools as fantomBoosts } from '../../../config/boost/fantom';
import { pools as fuseBoosts } from '../../../config/boost/fuse';
import { pools as harmonyBoosts } from '../../../config/boost/harmony';
import { pools as hecoBoosts } from '../../../config/boost/heco';
import { pools as metisBoosts } from '../../../config/boost/metis';
import { pools as moonriverBoosts } from '../../../config/boost/moonriver';
import { pools as polygonBoosts } from '../../../config/boost/polygon';
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
  earnContractAddress: string;
  pricePerFullShare: number;
  tvl: number;
  oraclePrice?: number | null; // pulled afterward
  oracle: string; // 'tokens' | 'lp';
  oracleId: TokenEntity['id'];
  status: string; // 'active' | 'eol';
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

interface FeaturedVaultConfig {
  [vaultId: VaultEntity['id']]: boolean;
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

const vaultsByChainId: {
  [chainId: ChainEntity['id']]: VaultConfig[];
} = {
  arbitrum: arbitrumVaults,
  avax: avaxVaults,
  bsc: bscVaults,
  celo: celoVaults,
  cronos: cronosVaults,
  fantom: fantomVaults,
  fuse: fuseVaults,
  harmony: harmonyVaults,
  heco: hecoVaults,
  metis: metisVaults,
  moonriver: moonriverVaults,
  polygon: polygonVaults,
};

const boostsByChainId: {
  [chainId: ChainEntity['id']]: BoostConfig[];
} = {
  arbitrum: arbitrumBoosts,
  avax: avaxBoosts,
  bsc: bscBoosts,
  celo: celoBoosts,
  cronos: cronosBoosts,
  fantom: fantomBoosts,
  fuse: fuseBoosts,
  harmony: harmonyBoosts,
  heco: hecoBoosts,
  metis: metisBoosts,
  moonriver: moonriverBoosts,
  polygon: polygonBoosts,
};

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

  public async fetchVaultByChainId(chainId: ChainEntity['id']): Promise<VaultConfig[]> {
    if (vaultsByChainId[chainId] !== undefined) {
      return vaultsByChainId[chainId];
    } else {
      throw Error(`Chain ${chainId} not supported`);
    }
  }

  public async fetchBoostsByChainId(chainId: ChainEntity['id']): Promise<BoostConfig[]> {
    if (boostsByChainId[chainId] !== undefined) {
      return boostsByChainId[chainId];
    } else {
      throw Error(`Chain ${chainId} not supported`);
    }
  }
}
