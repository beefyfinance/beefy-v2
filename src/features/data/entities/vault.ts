import type { ChainEntity } from './chain';
import type { PlatformEntity } from './platform';
import type { TokenEntity } from './token';

import type { ZapStrategyConfig } from '../apis/transact/strategies/strategy-configs';

// maybe a RiskAnalysis type would be better

export type VaultTag =
  | 'beefy'
  | 'bluechip'
  | 'low' /* low risk */
  | 'boost'
  | 'stable'
  | 'eol'
  | 'paused';

export type VaultType = 'standard' | 'gov' | 'cowcentrated';

export type VaultBase = {
  /** globally unique id for the vault */
  id: string;
  /** name of the vault (as in the config) */
  name: string;
  /** short name of the vault w/out Vault/Pool/CLM suffix */
  shortName: string;
  /** long name of the vault w/ Vault/Pool/CLM suffix */
  longName: string;
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

type VaultStandardOnly = {
  depositTokenAddress: string;
  earnedTokenAddress: string;
  strategyTypeId: string;

  /**
   * The protocol this vault rely on (Curve, boo finance, etc)
   */
  platformId: PlatformEntity['id'];

  assetType: 'lps' | 'single';

  safetyScore: number;

  risks: string[];

  buyTokenUrl: string | null;
  addLiquidityUrl: string | null;
  removeLiquidityUrl: string | null;

  depositFee: number;

  migrationIds?: string[];
  /** Map of chain->address of bridged receipt tokens */
  bridged?: Record<ChainEntity['id'], string>;
  lendingOracle?: { provider: string; address?: string; loops?: number };
  earningPoints: boolean;
};

type VaultGovBaseOnly = {
  depositTokenAddress: string;

  earnedTokenAddresses: string[];
  /**
   * so bifi-gov and bifi-maxi, are very special
   * those are the way in which we distribute platform revenue back to bifi holders
   * bifi-gov is stake BIFI earn NATIVE (gas token) without autocompounding
   * bifi-maxi is stake BIFI earn BIFI with autocompounding
   * bifi-maxi basically uses bifi-gov underneath
   * so all the money in BIFI-MAXI is actually inside the BIFI-GOV of that chain
   * so in order not to count TVL twice. when we count the tvl of the gov pools
   * we must exclude/substract the tvl from the maxi vault
   */
  excludedId: null | VaultBase['id'];

  strategyTypeId: string;

  platformId: PlatformEntity['id'];

  assetType: 'single';

  safetyScore: number;

  risks: string[];

  buyTokenUrl: string | null;
  addLiquidityUrl: null | string;
  removeLiquidityUrl: null;

  depositFee: number;

  migrationIds?: string[];
};

type VaultGovSingleOnly = VaultGovBaseOnly & {
  subType: 'single';
  // addLiquidityUrl: null;
};

type VaultGovMultiOnly = VaultGovBaseOnly & {
  subType: 'multi';
  // addLiquidityUrl: string;
};

type VaultCowcentratedOnly = VaultStandardOnly & {
  depositTokenAddresses: string[];
  feeTier: string;
};

type MakeVaultActive<TVaultType extends VaultType, TOnly> = { type: TVaultType } & VaultBase &
  VaultActive &
  TOnly;
type MakeVaultRetired<TVaultType extends VaultType, TOnly> = { type: TVaultType } & VaultBase &
  VaultRetired &
  TOnly;
type MakeVaultPaused<TVaultType extends VaultType, TOnly> = { type: TVaultType } & VaultBase &
  VaultPaused &
  TOnly;

type MakeVault<TVaultType extends VaultType, TOnly> =
  | MakeVaultActive<TVaultType, TOnly>
  | MakeVaultRetired<TVaultType, TOnly>
  | MakeVaultPaused<TVaultType, TOnly>;

export type VaultStandard = MakeVault<'standard', VaultStandardOnly>;
export type VaultGovSingle = MakeVault<'gov', VaultGovSingleOnly>;
export type VaultGovMulti = MakeVault<'gov', VaultGovMultiOnly>;
export type VaultGov = VaultGovSingle | VaultGovMulti;
export type VaultCowcentrated = MakeVault<'cowcentrated', VaultCowcentratedOnly>;
export type VaultEntity = VaultStandard | VaultGov | VaultCowcentrated;
export type VaultEntityActive = Extract<VaultEntity, VaultActive>;
export type VaultEntityPaused = Extract<VaultEntity, VaultPaused>;
export type VaultEntityRetired = Extract<VaultEntity, VaultRetired>;

export function isGovVault(vault: VaultEntity): vault is VaultGov {
  return vault.type === 'gov';
}

export function isGovVaultMulti(vault: VaultGov): vault is VaultGovMulti {
  return vault.subType === 'multi';
}

export function isGovVaultSingle(vault: VaultGov): vault is VaultGovSingle {
  return vault.subType === 'single';
}

export function isMultiGovVault(vault: VaultEntity): vault is VaultGovMulti {
  return isGovVault(vault) && vault.subType === 'multi';
}

export function isSingleGovVault(vault: VaultEntity): vault is VaultGovSingle {
  return isGovVault(vault) && vault.subType === 'single';
}

export function isStandardVault(vault: VaultEntity): vault is VaultStandard {
  return vault.type === 'standard';
}

export function isCowcentratedVault(vault: VaultEntity): vault is VaultCowcentrated {
  return vault.type === 'cowcentrated';
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
  return !isGovVault(vault) && vault.earningPoints === true;
}

export function isVaultPausedOrRetired(vault: VaultEntity) {
  return vault.status === 'paused' || vault.status === 'eol';
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
