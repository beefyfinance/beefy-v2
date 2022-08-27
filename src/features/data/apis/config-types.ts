import { VaultEntity } from '../entities/vault';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { PlatformEntity } from '../entities/platform';
import { StrategyTypeEntity } from '../entities/strategy-type';

export interface VaultConfig {
  id: string;
  logo?: string | null;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenProviderId?: PlatformEntity['id'];
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number | null;
  earnContractAddress: string;
  oracle: string; // 'tokens' | 'lp';
  oracleId: TokenEntity['id'];
  status: string; // 'active' | 'eol' | 'paused';
  platformId: PlatformEntity['id'];
  assets?: TokenEntity['id'][];
  risks?: string[] | null;
  strategyTypeId: StrategyTypeEntity['id'];
  network: string;
  excluded?: string | null;
  isGovVault?: boolean | null;
  callFee?: number | null;
  createdAt?: number | null;
  addLiquidityUrl?: string | null;
  buyTokenUrl?: string | null;
  retireReason?: string | null;
  pauseReason?: string | null;
  removeLiquidityUrl?: string | null;
  depositFee?: string | null;
  refund?: boolean | null;
  refundContractAddress?: string | null;
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
  Solace: ChainEntity['id'][];
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
  type?: 'uniswapv2' | 'solidly';
  withdrawEstimateMode?: 'getAmountOut' | 'getAmountsOut' | 'getAmountOutWithFee';
  withdrawEstimateFee?: string;
  lpProviderFee: number;
}

export interface MinterConfigTokenErc20 {
  oracleId: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  type: 'erc20';
}

export interface MinterConfigTokenNative {
  oracleId: string;
  symbol: string;
  contractAddress: string;
  decimals: number;
  type: 'native';
}

export type MinterConfigToken = MinterConfigTokenErc20 | MinterConfigTokenNative;

export interface MinterConfig {
  id: string;
  name: string;
  contractAddress: string;
  depositToken: MinterConfigToken;
  mintedToken: MinterConfigToken;
  canBurnReserves: boolean;
  reserveBalanceMethod?: string;
  vaultIds: string[];
}

export interface InfoCardConfigContent {
  heading?: string;
  text: string;
}

export interface InfoCardConfigAction {
  type: 'code' | 'link';
  text: string;
  url: string;
}

export interface InfoCardBaseConfig {
  id: string;
  supertitle?: string;
  title: string;
  actions?: InfoCardConfigAction[];
  content: InfoCardConfigContent[];
}

export interface InfoCardVaultConfig extends InfoCardBaseConfig {
  vaultIds?: VaultEntity['id'][];
}

export interface InfoCardChainConfig extends InfoCardBaseConfig {
  chainIds?: ChainEntity['id'][];
}

export type InfoCardConfig = InfoCardVaultConfig | InfoCardChainConfig;
export type InfoCardsConfig = InfoCardConfig[];

export type StrategyTypeConfig = {
  id: string;
  name: string;
};

export type PlatformConfig = {
  id: string;
  name: string;
  filter: boolean;
};
