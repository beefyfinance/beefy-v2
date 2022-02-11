import { QiDao, Insurace, Moonpot, LaCucina } from '../helpers/partners';
import { featuredPools as featuredVaults } from './vault/featured';

import { pools as arbitrumVaults } from './vault/arbitrum';
import { pools as auroraVaults } from './vault/aurora';
import { pools as avaxVaults } from './vault/avax';
import { pools as bscVaults } from './vault/bsc';
import { pools as celoVaults } from './vault/celo';
import { pools as cronosVaults } from './vault/cronos';
import { pools as fantomVaults } from './vault/fantom';
import { pools as fuseVaults } from './vault/fuse';
import { pools as harmonyVaults } from './vault/harmony';
import { pools as hecoVaults } from './vault/heco';
import { pools as metisVaults } from './vault/metis';
import { pools as moonriverVaults } from './vault/moonriver';
import { pools as polygonVaults } from './vault/polygon';

import { pools as arbitrumBoosts } from './boost/arbitrum';
import { pools as auroraBoosts } from './boost/aurora';
import { pools as avaxBoosts } from './boost/avax';
import { pools as bscBoosts } from './boost/bsc';
import { pools as celoBoosts } from './boost/celo';
import { pools as cronosBoosts } from './boost/cronos';
import { pools as fantomBoosts } from './boost/fantom';
import { pools as fuseBoosts } from './boost/fuse';
import { pools as harmonyBoosts } from './boost/harmony';
import { pools as hecoBoosts } from './boost/heco';
import { pools as metisBoosts } from './boost/metis';
import { pools as moonriverBoosts } from './boost/moonriver';
import { pools as polygonBoosts } from './boost/polygon';

import { TokenEntity } from '../features/data/entities/token';
import { PlatformEntity } from '../features/data/entities/platform';
import { VaultEntity } from '../features/data/entities/vault';
import { ChainEntity } from '../features/data/entities/chain';

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

const vaultsByChainId: {
  [chainId: ChainEntity['id']]: VaultConfig[];
} = {
  arbitrum: arbitrumVaults,
  aurora: auroraVaults,
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
  aurora: auroraBoosts,
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

export const configs = {
  vaultsByChainId,
  boostsByChainId,
  partners: { QiDao, Insurace, Moonpot, LaCucina },
  featuredVaults,
};
