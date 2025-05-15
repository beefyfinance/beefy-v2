import type { ChainEntity } from './chain.ts';
import type { PlatformEntity } from './platform.ts';
import type { TokenEntity } from './token.ts';
import type { ZapStrategyConfig } from '../apis/transact/strategies/strategy-configs.ts';

// maybe a RiskAnalysis type would be better

export type VaultTag =
  | 'beefy'
  | 'bluechip'
  | 'low' /* low risk */
  | 'boost'
  | 'stable'
  | 'eol'
  | 'paused';

export type VaultType = 'standard' | 'gov' | 'cowcentrated' | 'erc4626';

export type VaultNames = {
  /** w/out Vault/Pool/CLM suffix */
  short: string;
  /** w/ Vault/Pool/CLM suffix */
  long: string;
  /** vault list */
  list: string;
  /** single vault page header */
  single: string;
  /** single vault page meta title */
  singleMeta: string;
};

export type VaultBase = {
  /** globally unique id for the vault */
  id: string;
  /** name of the vault (as in the config) */
  name: string;
  /** icons to use instead of assets */
  icons?: string[];
  /** variations of name used in different contexts */
  names: VaultNames;
  /** contract version, increased when app needs to behave differently for the same vault type */
  version: number;
  /** chain the vault is on */
  chainId: ChainEntity['id'];
  /** address book token ids of assets used to deposit in the vault (deposit token for single, token0/1 for LP) */
  assetIds: TokenEntity['id'][];
  /** when the vault was added to the app, unix timestamp */
  createdAt: number;
  /** when the something about the vault changed, unix timestamp, used for default sort */
  updatedAt: number;
  /** config for zaps available on this vault */
  zaps: ZapStrategyConfig[];
  /** the vault contract address (earnContractAddress in config) */
  contractAddress: string;
  /** type of asset the vault uses */
  assetType: 'single' | 'lps' | 'clm';
  /** id of vaults to exclude from this vault's tvl */
  excludedIds: VaultBase['id'][];
  /** whether users in the vault earn external points */
  earningPoints: boolean;
  /** point structure ids for the vault */
  pointStructureIds: string[];
  /** platform where the token is deposited to earn */
  platformId: PlatformEntity['id'];
  /** used to describe how the strategy works */
  strategyTypeId: string;
  /** risk assessments per category */
  risks: string[];
  /** score calculated from risks [0 if risks was empty] */
  safetyScore: number;
  /** where you can buy the deposit token */
  buyTokenUrl?: string | undefined;
  /** where you create the deposit LP token */
  addLiquidityUrl?: string | undefined;
  /** where you break the deposit LP token */
  removeLiquidityUrl?: string | undefined;
  /** underlying platforms deposit fee */
  depositFee: number;
  /** what helper can be used to migrate user from underlying platform to beefy */
  migrationIds: string[];
  /** whether vault should be hidden from user */
  hidden: boolean;
  /** link to pooltogether game */
  poolTogether?: string;
  /** id to use to look up lp breakdown/underlying tvl */
  breakdownId: string;
};

export type VaultActive = {
  status: 'active';
};

export type VaultRetired = {
  status: 'eol';
  /** retire reason code */
  retireReason: string;
  /** when the vault was retired, unix timestamp */
  retiredAt: number;
};

export type VaultPaused = {
  status: 'paused';
  /** paused reason code */
  pauseReason: string;
  /** when the vault was paused, unix timestamp */
  pausedAt: number;
};

export type VaultStatus = VaultActive | VaultRetired | VaultPaused;

export type VaultStandardBaseOnly = {
  /** address of token required to deposit in this vault */
  depositTokenAddress: string;
  /** address of receipt token (=== vault contract address)*/
  receiptTokenAddress: string;
  /** Map of chain->address of bridged receipt tokens */
  bridged?: Record<ChainEntity['id'], string>;
  lendingOracle?: {
    provider: string;
    address?: string;
    loops?: number;
  };
};

type VaultStandardOnly = VaultStandardBaseOnly & {
  subType: 'standard';
};

export type VaultGovBaseOnly = {
  /** address of token required to deposit in this vault */
  depositTokenAddress: string;
  earnedTokenAddresses: string[];
};

type VaultGovSingleOnly = VaultGovBaseOnly & {
  subType: 'gov';
  /** single - the contract supports only 1 reward token */
  contractType: 'single';
};

type VaultGovMultiOnly = VaultGovBaseOnly & {
  subType: 'gov';
  /** multi - the contract supports multiple reward tokens */
  contractType: 'multi';
  /** address of receipt token (=== vault contract address)*/
  receiptTokenAddress: string;
};

export type VaultCowcentratedBaseOnly = {
  /** subtype */
  subType: 'cowcentrated';
  cowcentratedIds: {
    /** the id of the cowcentrated vault */
    clm: string;
    /** the id of the cowcentrated gov vault, if one exists and is active */
    pool?: string;
    /** the id of the cowcentrated standard vault, if one exists and is active */
    vault?: string;
    /** ids of cowcentrated gov vaults */
    pools: string[];
    /** ids of cowcentrated standard vaults */
    vaults: string[];
  };
  /** addresses of tokens required to deposit in this vault */
  depositTokenAddresses: string[];
  /** the trading fee of the underlying pool */
  feeTier: string;
  /** the address of the underlying CL pool */
  poolAddress: string;
  /** risk assessments per category */
  risks: string[];
  /** score calculated from risks [0 if risks was empty] */
  safetyScore: number;
};

type VaultCowcentratedOnly = VaultCowcentratedBaseOnly & {
  subType: 'cowcentrated';
  /** address of receipt token (=== vault contract address)*/
  receiptTokenAddress: string;
  /** for clm this is `${poolAddress}-{vaultId}` for compat reasons */
  depositTokenAddress: string;
};

type VaultGovCowcentratedOnly = VaultCowcentratedBaseOnly &
  VaultGovBaseOnly & {
    /** address of receipt token (=== vault contract address)*/
    receiptTokenAddress: string;
    /** multi - the contract supports multiple reward tokens */
    contractType: 'multi';
  };

type VaultStandardCowcentratedOnly = VaultCowcentratedBaseOnly &
  VaultStandardBaseOnly & {
    /** address of receipt token (=== vault contract address)*/
    receiptTokenAddress: string;
  };

/**
 * @see {https://eips.ethereum.org/EIPS/eip-4626}
 */
export type VaultErc4626BaseOnly = {
  /** address of token required to deposit in this vault */
  depositTokenAddress: string;
  /** address of receipt token (=== vault contract address)*/
  receiptTokenAddress: string;
};

/**
 * Async version of ERC4626
 * For this subType, only the `withdraw` method is async
 * @see {https://eips.ethereum.org/EIPS/eip-7540}
 */
type VaultErc4626AsyncWithdrawOnly = VaultErc4626BaseOnly & {
  subType: 'erc7540:withdraw';
};

type MakeVaultActive<TVaultType extends VaultType, TOnly> = {
  type: TVaultType;
} & VaultBase &
  VaultActive &
  TOnly;
type MakeVaultRetired<TVaultType extends VaultType, TOnly> = {
  type: TVaultType;
} & VaultBase &
  VaultRetired &
  TOnly;
type MakeVaultPaused<TVaultType extends VaultType, TOnly> = {
  type: TVaultType;
} & VaultBase &
  VaultPaused &
  TOnly;

type MakeVault<TVaultType extends VaultType, TOnly> =
  | MakeVaultActive<TVaultType, TOnly>
  | MakeVaultRetired<TVaultType, TOnly>
  | MakeVaultPaused<TVaultType, TOnly>;

export type VaultStandardBeefy = MakeVault<'standard', VaultStandardOnly>;
export type VaultStandardCowcentrated = MakeVault<'standard', VaultStandardCowcentratedOnly>;
export type VaultStandard = VaultStandardBeefy | VaultStandardCowcentrated;

export type VaultGovSingle = MakeVault<'gov', VaultGovSingleOnly>;
export type VaultGovMulti = MakeVault<'gov', VaultGovMultiOnly>;
export type VaultGovCowcentrated = MakeVault<'gov', VaultGovCowcentratedOnly>;
export type VaultGov = VaultGovSingle | VaultGovMulti | VaultGovCowcentrated;

export type VaultCowcentrated = MakeVault<'cowcentrated', VaultCowcentratedOnly>;
export type VaultCowcentratedLike =
  | VaultCowcentrated
  | VaultGovCowcentrated
  | VaultStandardCowcentrated;

export type VaultErc4626AsyncWithdraw = MakeVault<'erc4626', VaultErc4626AsyncWithdrawOnly>;
export type VaultErc4626 = VaultErc4626AsyncWithdraw;

export type VaultWithPricePerFullShare = VaultStandard | VaultErc4626;
export type VaultWithReceipt =
  | VaultStandard
  | VaultGovMulti
  | VaultGovCowcentrated
  | VaultCowcentrated
  | VaultErc4626;

export type VaultEntity = VaultStandard | VaultGov | VaultCowcentrated | VaultErc4626;
export type VaultEntityActive = Extract<VaultEntity, VaultActive>;
export type VaultEntityPaused = Extract<VaultEntity, VaultPaused>;
export type VaultEntityRetired = Extract<VaultEntity, VaultRetired>;

export function isGovVault(vault: VaultEntity): vault is VaultGov {
  return vault.type === 'gov';
}

export function isGovVaultMulti(vault: VaultGov): vault is VaultGovMulti {
  return vault.contractType === 'multi';
}

export function isGovVaultSingle(vault: VaultGov): vault is VaultGovSingle {
  return vault.contractType === 'single';
}

export function isGovVaultCowcentrated(vault: VaultGov): vault is VaultGovCowcentrated {
  return vault.subType === 'cowcentrated';
}

export function isMultiGovVault(vault: VaultEntity): vault is VaultGovMulti {
  return isGovVault(vault) && vault.contractType === 'multi';
}

export function isSingleGovVault(vault: VaultEntity): vault is VaultGovSingle {
  return isGovVault(vault) && vault.contractType === 'single';
}

export function isCowcentratedGovVault(vault: VaultEntity): vault is VaultGovCowcentrated {
  return isGovVault(vault) && vault.subType === 'cowcentrated';
}

export function isStandardVault(vault: VaultEntity): vault is VaultStandard {
  return vault.type === 'standard';
}

export function isStandardBeefyVault(vault: VaultEntity): vault is VaultStandardBeefy {
  return isStandardVault(vault) && vault.subType === 'standard';
}

export function isCowcentratedStandardVault(
  vault: VaultEntity
): vault is VaultStandardCowcentrated {
  return isStandardVault(vault) && vault.subType === 'cowcentrated';
}

export function isCowcentratedVault(vault: VaultEntity): vault is VaultCowcentrated {
  return vault.type === 'cowcentrated';
}

export function isCowcentratedLikeVault(vault: VaultEntity): vault is VaultCowcentratedLike {
  return (
    isCowcentratedVault(vault) ||
    isCowcentratedGovVault(vault) ||
    isCowcentratedStandardVault(vault)
  );
}

export function isErc4626Vault(vault: VaultEntity): vault is VaultErc4626 {
  return vault.type === 'erc4626';
}

export function isErc4626AsyncWithdrawVault(
  vault: VaultEntity
): vault is VaultErc4626AsyncWithdraw {
  return isErc4626Vault(vault) && vault.subType === 'erc7540:withdraw';
}

export function isVaultWithReceipt(vault: VaultEntity): vault is VaultWithReceipt {
  return !isSingleGovVault(vault);
}

export function isVaultWithPricePerFullShare(
  vault: VaultEntity
): vault is VaultWithPricePerFullShare {
  return isStandardVault(vault) || isErc4626Vault(vault);
}

export function isVaultRetired(vault: VaultEntity): vault is VaultEntityRetired {
  return vault.status === 'eol';
}

export function isVaultActive(vault: VaultEntity): vault is VaultEntityActive {
  return vault.status === 'active';
}

export function isVaultPaused(vault: VaultEntity): vault is VaultEntityPaused {
  return vault.status === 'paused';
}

export function isVaultEarningPoints(vault: VaultEntity) {
  return vault.earningPoints === true;
}

export function isVaultPausedOrRetired(vault: VaultEntity) {
  return vault.status === 'paused' || vault.status === 'eol';
}

/** The most recent active pool, or most recent pool if no active pools, or undefined if no pools */
export function getCowcentratedPool(vault: VaultCowcentratedLike): string | undefined {
  if (vault.cowcentratedIds.pool) {
    return vault.cowcentratedIds.pool;
  }
  if (vault.cowcentratedIds.pools.length) {
    return vault.cowcentratedIds.pools[0];
  }
  return undefined;
}

/** The most recent active vault, or most recent vault if no active vaults, or undefined if no vaults */
export function getCowcentratedVault(vault: VaultCowcentratedLike): string | undefined {
  if (vault.cowcentratedIds.vault) {
    return vault.cowcentratedIds.vault;
  }
  if (vault.cowcentratedIds.vaults.length) {
    return vault.cowcentratedIds.vaults[0];
  }
  return undefined;
}

export function shouldVaultShowInterest(vault: VaultEntity) {
  if (isVaultRetired(vault)) {
    return false;
  }

  if (isVaultPaused(vault)) {
    // Still earning reasons
    return !!vault.pauseReason && ['viability', 'ren-sunset'].includes(vault.pauseReason);
  }

  return true;
}
