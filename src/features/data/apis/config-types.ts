import { VaultEntity } from '../entities/vault';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { PlatformEntity } from '../entities/platform';
import { StrategyTypeEntity } from '../entities/strategy-type';
import { AmmEntity } from '../entities/amm';
import { ZapFee } from './transact/transact-types';

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

export interface PartnersConfig {
  QiDao: VaultEntity['id'][];
  Insurace: ChainEntity['id'][];
  Nexus: ChainEntity['id'][];
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

export interface StandardGasConfig {
  type: 'standard';
  /** add this % on top of gas price from RPC (0-1) */
  safetyMargin?: number;
  /** set gas price to at least this (wei) */
  minimum?: string;
  /** set gas price to at most this (wei) */
  maximum?: string;
}

export interface EIP1559GasConfig {
  type: 'eip1559';
  /** how many past blocks should we look at when calculating fee */
  blocks: number;
  /** what percentage of those blocks should we aim to be included in (0-1) */
  percentile: number;
  /** add this % on top of base gas price from RPC (0-1) */
  baseSafetyMargin?: number;
  /** set base gas price to at least this (wei) */
  baseMinimum?: string;
  /** set base gas price to at most this (wei) */
  baseMaximum?: string;
  /** add this % on top of priority gas price from RPC (0-1) */
  prioritySafetyMargin?: number;
  /** set priority gas price to at least this (wei) */
  priorityMinimum?: string;
  /** set priority gas price to at most this (wei) */
  priorityMaximum?: string;
}

export interface CeloGasConfig {
  type: 'celo';
}

export type GasConfig = StandardGasConfig | EIP1559GasConfig | CeloGasConfig;

export interface ChainConfig {
  id: string;
  name: string;
  chainId: number;
  rpc: string[];
  explorerUrl: string;
  multicallAddress: string;
  appMulticallContractAddress: string;
  oneInchPriceOracleAddress?: string;
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
  gas: GasConfig;
  stableCoins: string[];
}

export interface AmmConfigBase {
  id: string;
  name: string;
  routerAddress: string;
  factoryAddress: string;
  pairInitHash: string;
  minimumLiquidity: string;
  swapFeeNumerator: string;
  swapFeeDenominator: string;
}

export interface AmmConfigUniswapV2 extends AmmConfigBase {
  readonly type: 'uniswapv2';
  mintFeeNumerator: string;
  mintFeeDenominator: string;
  getAmountOutMode: 'getAmountOut' | 'getAmountsOut' | 'getAmountOutWithFee';
}

export interface AmmConfigSolidly extends AmmConfigBase {
  readonly type: 'solidly';
  getAmountOutMode: 'getAmountOut';
}

export type AmmConfig = AmmConfigUniswapV2 | AmmConfigSolidly;

export function isSolidlyAmmConfig(amm: AmmConfig): amm is AmmConfigSolidly {
  return amm.type === 'solidly';
}

export function isUniswapV2AmmConfig(amm: AmmConfig): amm is AmmConfigUniswapV2 {
  return amm.type === 'uniswapv2';
}

export interface BeefyZapConfig {
  zapAddress: string; // identifier
  ammId: AmmEntity['id'];
  chainId: ChainEntity['id'];
}

export interface OneInchZapConfig {
  zapAddress: string; // identifier
  chainId: ChainEntity['id'];
  depositFromTokens: TokenEntity['id'][];
  withdrawToTokens: TokenEntity['id'][];
  blockedTokens: TokenEntity['id'][];
  blockedVaults: VaultEntity['id'][];
  fee: ZapFee;
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
  hasEarningsPool: boolean;
  reserveBalanceMethod?: string;
  vaultIds: string[];
  canZapInWithOneInch?: boolean;
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

export interface TokenHoldingConfig {
  name: string;
  address: string;
  decimals: number;
  oracleId: string;
  oracleType: 'lps' | 'token' | 'validator';
  assetType: 'token' | 'native' | 'validator';
  price: number;
  usdValue: string;
  balance: string;
  methodPath?: string;
}

export interface VaultHoldingConfig {
  name: string;
  address: string;
  decimals: number;
  oracleId: string;
  oracleType: 'lps';
  assetType: 'vault';
  price: number;
  usdValue: string;
  balance: string;
  vaultId: VaultEntity['id'];
  pricePerFullShare: string;
  methodPath?: string;
}

export type TreasuryHoldingConfig = TokenHoldingConfig | VaultHoldingConfig;

export function isVaultHoldingConfig(token: TreasuryHoldingConfig): token is VaultHoldingConfig {
  return token.assetType === 'vault';
}

export function isTokenHoldingConfig(token: TreasuryHoldingConfig): token is TokenHoldingConfig {
  return token.assetType !== 'vault';
}

export type TreasuryConfig = {
  [chainId: ChainEntity['id']]: {
    [address: string]: {
      name: string;
      balances: {
        [address: string]: TreasuryHoldingConfig;
      };
    };
  };
};
