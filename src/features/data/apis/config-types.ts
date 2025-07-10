import type { VaultEntity } from '../entities/vault.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { PlatformEntity } from '../entities/platform.ts';
import type { ZapFee } from './transact/transact-types.ts';
import type { ChangeTypeOfKeys } from '../utils/types-utils.ts';
import type BigNumber from 'bignumber.js';
import type { Address } from 'viem';
import type { ZapStrategyConfig } from './transact/strategies/strategy-configs.ts';

export interface VaultConfig {
  id: string;
  name: string;
  icons?: string[];
  type: 'standard' | 'erc4626' | 'gov' | 'cowcentrated';
  subType?: 'standard' | 'cowcentrated' | 'gov' | 'multi-gov' | 'erc7540:withdraw';
  /** version of vault type defaults to 1 */
  version?: number;
  token: string;
  tokenAddress?: string | null;
  tokenDecimals: number;
  depositTokenAddresses?: string[];
  tokenProviderId?: PlatformEntity['id'];
  zaps?: ZapStrategyConfig[];

  earnedToken: string; // multi gov vaults have it as the receiptToken

  earnOracleId?: string; //multi gov vault receiptToken

  earnedTokenAddress?: string; // only missing in multi gov vaults
  earnedTokenDecimals?: number | null; // only missing in multi gov vaults

  earnedTokenAddresses?: string[]; // only available in multi gov vaults

  earnContractAddress: string;
  oracle: string; // 'tokens' | 'lps';

  oracleId: TokenEntity['id']; // only missing in multi gov vaults

  status: string; // 'active' | 'eol' | 'paused';
  platformId: PlatformEntity['id'];
  assets?: TokenEntity['id'][];
  risks?: string[] | null;
  strategyTypeId: string;
  network: string;
  excluded?: string | null;
  callFee?: number | null;
  createdAt: number;
  addLiquidityUrl?: string | null;
  buyTokenUrl?: string | null;
  retireReason?: string;
  retiredAt?: number;
  pauseReason?: string;
  pausedAt?: number;
  /** Used for sorting, not required in config, defaults to createdAt */
  updatedAt?: number;
  removeLiquidityUrl?: string | null;
  depositFee?: number | undefined;
  refund?: boolean | null;
  refundContractAddress?: string | null;
  showWarning?: boolean | null;
  warning?: string | null;
  migrationIds?: string[];
  /** Map of chain->address of bridged receipt tokens */
  bridged?: Record<ChainEntity['id'], string>;
  /* Oracle can be ChainLink | Pyth, then the oracle address*/
  lendingOracle?: {
    provider: string;
    address?: string;
    loops?: number;
  };
  pointStructureIds?: string[];
  feeTier?: string;
  /** tmp: exclude from being loaded */
  hidden?: boolean;
  poolTogether?: string;
}

export interface PartnersConfig {
  QiDao: VaultEntity['id'][];
  Nexus: ChainEntity['id'][];
}

export interface BoostConfig {
  id: string;
  poolId: string;
  name: string;
  tagIcon?: string;
  tagText?: string;
  assets?: string[] | null;
  earnedToken: string;
  earnedTokenDecimals: number;
  earnedTokenAddress: string;
  earnContractAddress: string;
  version?: number;
  earnedOracle: string;
  earnedOracleId: string;
  partnership: boolean;
  status: string;
  isMooStaked: boolean;
  partners?: string[] | undefined;
  campaign?: string | undefined;
  fixedStatus?: boolean | null;
  /** tmp: exclude from being loaded */
  hidden?: boolean;
  /** @deprecated want() of the vault - used by various apis but not in app - look up via vault id instead */
  tokenAddress: string;
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

export interface GaslessGasConfig {
  type: 'gasless';
}

export type GasConfig = StandardGasConfig | EIP1559GasConfig | CeloGasConfig | GaslessGasConfig;

type ChainId =
  | 'ethereum'
  | 'polygon'
  | 'bsc'
  | 'optimism'
  | 'fantom'
  | 'arbitrum'
  | 'avax'
  | 'cronos'
  | 'moonbeam'
  | 'moonriver'
  | 'metis'
  | 'fuse'
  | 'kava'
  | 'canto'
  | 'zksync'
  | 'zkevm'
  | 'base'
  | 'gnosis'
  | 'linea'
  | 'mantle'
  | 'fraxtal'
  | 'mode'
  | 'manta'
  | 'real'
  | 'sei'
  | 'rootstock'
  | 'scroll'
  | 'lisk'
  | 'sonic'
  | 'aurora'
  | 'emerald'
  | 'berachain'
  | 'celo'
  | 'heco'
  | 'harmony'
  | 'saga'
  | 'hyperevm';

export type ChainConfig = {
  id: ChainId;
  name: string;
  eol?: number;
  chainId: number;
  rpc: string[];
  explorerUrl: string;
  explorerAddressUrlTemplate?: string;
  explorerTokenUrlTemplate?: string;
  explorerTxUrlTemplate?: string;
  multicall3Address: Address;
  appMulticallContractAddress: string;
  native: {
    symbol: string;
    oracleId: string;
    decimals: number;
  };
  gas: GasConfig;
  stableCoins: string[];
  new?: boolean;
  brand?: {
    icon?: 'solid' | 'gradient';
    header?: 'solid' | 'gradient';
  };
};

export interface AmmConfigBase {
  id: string;
  name: string;
}

export interface AmmConfigUniswapV2LikeBase extends AmmConfigBase {
  routerAddress: string;
  factoryAddress: string;
  pairInitHash: string;
  minimumLiquidity: string;
  swapFeeNumerator: string;
  swapFeeDenominator: string;
}

export interface AmmConfigUniswapV2 extends AmmConfigUniswapV2LikeBase {
  readonly type: 'uniswap-v2';
  mintFeeNumerator: string;
  mintFeeDenominator: string;
  getAmountOutMode: 'getAmountOut' | 'getAmountsOut' | 'getAmountOutWithFee';
}

export interface AmmConfigSolidly extends AmmConfigUniswapV2LikeBase {
  readonly type: 'solidly';
  getAmountOutMode: 'getAmountOut';
}

export interface AmmConfigGamma extends AmmConfigBase {
  readonly type: 'gamma';
  proxyAddress: string;
}

export interface AmmConfigBalancer extends AmmConfigBase {
  readonly type: 'balancer';
  /** address of Vault contract */
  vaultAddress: string;
  /** address of BalancerQueries contract */
  queryAddress: string;
}

export type AmmConfigUniswapV2Like = AmmConfigUniswapV2 | AmmConfigSolidly;
export type AmmConfig = AmmConfigUniswapV2Like | AmmConfigGamma | AmmConfigBalancer;

export function isSolidlyAmmConfig(amm: AmmConfig): amm is AmmConfigSolidly {
  return amm.type === 'solidly';
}

export function isUniswapV2AmmConfig(amm: AmmConfig): amm is AmmConfigUniswapV2 {
  return amm.type === 'uniswap-v2';
}

export interface ZapConfig {
  router: string;
  manager: string;
  chainId: ChainEntity['id'];
}

export interface OneInchSwapConfig {
  id: string;
  type: 'one-inch';
  chainId: ChainEntity['id'];
  priorityTokens: TokenEntity['id'][];
  blockedTokens: TokenEntity['id'][];
  blockedVaults: VaultEntity['id'][];
  fee: ZapFee;
}

export interface KyberSwapSwapConfig {
  id: string;
  type: 'kyber';
  chainId: ChainEntity['id'];
  priorityTokens: TokenEntity['id'][];
  blockedTokens: TokenEntity['id'][];
  blockedVaults: VaultEntity['id'][];
  fee: ZapFee;
}

export interface OdosSwapConfig {
  id: string;
  type: 'odos';
  chainId: ChainEntity['id'];
  priorityTokens: TokenEntity['id'][];
  blockedTokens: TokenEntity['id'][];
  blockedVaults: VaultEntity['id'][];
  fee: ZapFee;
}

export interface LiquidSwapSwapConfig {
  id: string;
  type: 'liquid-swap';
  chainId: ChainEntity['id'];
  priorityTokens: TokenEntity['id'][];
  blockedTokens: TokenEntity['id'][];
  blockedVaults: VaultEntity['id'][];
  fee: ZapFee;
}

export type SwapAggregatorConfig =
  | OneInchSwapConfig
  | KyberSwapSwapConfig
  | OdosSwapConfig
  | LiquidSwapSwapConfig;

export type SwapAggregatorConfigLoose = ChangeTypeOfKeys<
  SwapAggregatorConfig,
  'type' | 'chainId',
  string
>; // loosen type

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
  disableMint?: boolean;
  minterAddress: string;
  burnerAddress?: string;
  depositToken: MinterConfigToken;
  mintedToken: MinterConfigToken;
  canBurn: false | 'reserves' | 'supply';
  reserveBalanceMethod?: 'withdrawableBalance' | 'balanceOfWant';
  vaultIds: string[];
  canZapInWithOneInch?: boolean;
}

export type PlatformType =
  | 'amm'
  | 'alm'
  | 'bridge'
  | 'money-market'
  | 'perps'
  | 'yield-boost'
  | 'farm';

export type PlatformConfig = {
  readonly id: string;
  readonly name: string;
  readonly risks?: string[];
  readonly description?: string;
  readonly twitter?: string;
  readonly website?: string;
  readonly documentation?: string;
  readonly type?: PlatformType;
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
  [chainId in ChainEntity['id']]: {
    [address: string]: {
      name: string;
      balances: {
        [address: string]: TreasuryHoldingConfig;
      };
    };
  };
};

export type MarketMakerHoldingConfig = {
  symbol: string;
  name: string;
  oracleId: string;
  oracleType: 'tokens' | 'lps';
  usdValue: string;
  balance: string;
  price: number;
};

export type MarketMakerConfig = {
  [marketMakerId: string]: {
    [exchange: string]: {
      [tokenId: string]: MarketMakerHoldingConfig;
    };
  };
};

export type TreasuryCompleteBreakdownConfig = {
  treasury: TreasuryConfig;
  marketMaker: MarketMakerConfig;
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
  chains: Partial<Record<ChainEntity['id'], BeefyCommonBridgeChainConfig>>;
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
  {
    id: T;
  }
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
  tokens: Partial<Record<ChainEntity['id'], string>>;
  /**
   * Config per bridge
   */
  bridges: ReadonlyArray<BeefyAnyBridgeConfig>;
}>;
