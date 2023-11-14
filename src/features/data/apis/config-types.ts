import type { VaultEntity } from '../entities/vault';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity } from '../entities/token';
import type { PlatformEntity } from '../entities/platform';
import type { AmmEntity } from '../entities/amm';
import type { ZapFee } from './transact/transact-types';
import type BigNumber from 'bignumber.js';

export interface VaultConfig {
  id: string;
  name: string;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  tokenProviderId?: PlatformEntity['id'];
  tokenAmmId?: AmmEntity['id'];
  earnedToken: string;
  earnedTokenAddress: string;
  earnedTokenDecimals?: number | null;
  earnContractAddress: string;
  oracle: string; // 'tokens' | 'lps';
  oracleId: TokenEntity['id'];
  status: string; // 'active' | 'eol' | 'paused';
  platformId: PlatformEntity['id'];
  assets?: TokenEntity['id'][];
  risks?: string[] | null;
  strategyTypeId: string;
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
  migrationIds?: string[];
  /** Map of chain->address of bridged receipt tokens */
  bridged?: Record<ChainEntity['id'], string>;
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
  eol?: number;
  chainId: number;
  rpc: string[];
  explorerUrl: string;
  explorerAddressUrlTemplate?: string;
  explorerTokenUrlTemplate?: string;
  explorerTxUrlTemplate?: string;
  multicallAddress: string;
  appMulticallContractAddress: string;
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
  new?: boolean;
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
  priceOracleAddress: string;
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
  minterAddress: string;
  burnerAddress?: string;
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

export type PlatformConfig = {
  id: string;
  name: string;
};

export interface TokenHoldingConfig {
  id: string;
  name: string;
  address: string;
  decimals: number;
  oracleId: string;
  oracleType: 'lps' | 'token' | 'validator';
  assetType: 'token' | 'native' | 'validator' | 'concLiquidity';
  price: number;
  usdValue: string;
  balance: string;
  methodPath?: string;
  symbol: string;
  staked: boolean;
  numberId?: string;
}

export interface VaultHoldingConfig {
  id: string;
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
  staked: boolean;
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

export interface BridgeConfig {
  readonly id: string;
  readonly name: string;
  readonly tagName?: string;
  readonly website: string;
}

export type BaseMigrationConfig = {
  readonly id: string; // eg ethereum-conic
  readonly name: string; // eg Conic Finance
  readonly icon: string;
};

export type BeefyCommonBridgeChainConfig = {
  /** Address of our deployed bridge contract */
  bridge: string;
  /** Disable sending from this chain via this bridge **/
  sendDisabled?: boolean;
  /** Disable receiving to this chain via this bridge **/
  receiveDisabled?: boolean;
  /** Time estimate displayed to user is from chain's outgoing + in chain's incoming estimates */
  time: {
    /** Length of time in minutes for an incoming tx to go through */
    incoming: number;
    /** Length of time in minutes for an outgoing tx to go through */
    outgoing: number;
  };
  gasLimits: {
    /** Rough gas limit for approving mooBIFI to be spent by bridge (ETH only) */
    approve?: BigNumber;
    /** Rough gas limit for outgoing bridge TX on source chain */
    outgoing: BigNumber;
    /** Rough gas limit for incoming bridge TX on destination chain */
    incoming: BigNumber;
  };
};

export type BeefyCommonBridgeConfig = {
  /** Name of bridge */
  title: string;
  /** Url of bridge explorer, use {{hash}} for outgoing tx hash */
  explorerUrl?: string;
  /** Chains supported by this bridge */
  chains: Record<ChainEntity['id'], BeefyCommonBridgeChainConfig>;
};

export type BeefyLayerZeroBridgeConfig = BeefyCommonBridgeConfig & {
  id: 'layer-zero';
};

export type BeefyOptimismBridgeConfig = BeefyCommonBridgeConfig & {
  id: 'optimism';
};

export type BeefyChainlinkBridgeConfig = BeefyCommonBridgeConfig & {
  id: 'chainlink';
};

export type BeefyAxelarBridgeConfig = BeefyCommonBridgeConfig & {
  id: 'axelar';
};

export type BeefyAnyBridgeConfig =
  | BeefyLayerZeroBridgeConfig
  | BeefyOptimismBridgeConfig
  | BeefyChainlinkBridgeConfig
  | BeefyAxelarBridgeConfig;

export type BeefyBridgeIdToConfig<T extends BeefyAnyBridgeConfig['id']> = Extract<
  BeefyAnyBridgeConfig,
  { id: T }
>;

export type BeefyBridgeConfig = Readonly<{
  /**
   * The real token on the source chain
   */
  source: {
    id: string;
    symbol: string;
    chainId: ChainEntity['id'];
    oracleId: string;
    address: string;
    decimals: number;
  };
  /**
   * xTokens per chain
   */
  tokens: Record<ChainEntity['id'], string>;
  /**
   * Config per bridge
   */
  bridges: ReadonlyArray<BeefyAnyBridgeConfig>;
}>;
