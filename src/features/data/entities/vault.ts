import type { ChainEntity } from './chain';
import type { PlatformEntity } from './platform';
import type { TokenEntity } from './token';
import type { StrategyOptions } from '../apis/transact/strategies/IStrategy';

// maybe a RiskAnalysis type would be better

export type VaultTag =
  | 'beefy'
  | 'bluechip'
  | 'low' /* low risk */
  | 'boost'
  | 'stable'
  | 'eol'
  | 'paused';

/**
 * A vault is anything you can stake stuff into
 * - could be a single token vault
 * - could be an LP vault
 * - could be a bifi boost (gov vault)
 *
 * Sometimes also named "pool"
 */
export interface VaultStandard {
  id: string;
  name: string;
  type: 'standard';
  version: number;
  depositTokenAddress: string;
  zaps: StrategyOptions[];

  /**
   * ASSETS are basically the assets that are in that vault
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assetIds: TokenEntity['id'][];

  chainId: ChainEntity['id'];

  earnedTokenAddress: string;

  /**
   * The vault contract address
   */
  earnContractAddress: string;

  strategyTypeId: string;

  /**
   * The protocol this vault rely on (Curve, boo finance, etc)
   */
  platformId: PlatformEntity['id'];

  status: 'active' | 'eol' | 'paused';
  createdAt: number;
  /** Used for sorting, not required in config but defaults to createdAt on load so always available on entity */
  updatedAt: number;
  retireReason?: string;
  retiredAt?: number;
  pauseReason?: string;
  pausedAt?: number;

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
}

export interface VaultGov {
  id: string;
  name: string;
  type: 'gov';
  version: number;
  depositTokenAddress: string;

  /**
   * ASSETS are basically the assets that are in that vault
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assetIds: TokenEntity['id'][];

  chainId: ChainEntity['id'];

  earnedTokenAddress: string;

  /**
   * Vault address "treasury", we ask this address about user balances
   */
  earnContractAddress: string;

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
  excludedId: null | VaultEntity['id'];

  strategyTypeId: string;

  platformId: PlatformEntity['id'];

  status: 'active' | 'eol' | 'paused';
  createdAt: number;
  /** Used for sorting, not required in config but defaults to createdAt on load so always available on entity */
  updatedAt: number;
  retireReason?: string;
  retiredAt?: number;
  pauseReason?: string;
  pausedAt?: number;

  assetType: 'single';

  safetyScore: number;

  risks: string[];

  buyTokenUrl: string | null;
  addLiquidityUrl: null;
  removeLiquidityUrl: null;

  depositFee: number;

  migrationIds?: string[];
}

export type VaultCowcentrated = Omit<VaultStandard, 'type'> & {
  type: 'cowcentrated';
};

export function isGovVault(vault: VaultEntity): vault is VaultGov {
  return vault.type === 'gov';
}

export function isStandardVault(vault: VaultEntity): vault is VaultStandard {
  return vault.type === 'standard';
}

export function isCowcentratedLiquidityVault(vault: VaultEntity): vault is VaultCowcentrated {
  return vault.type === 'cowcentrated';
}

export function isVaultRetired(vault: VaultEntity) {
  return vault.status === 'eol';
}

export function isVaultActive(vault: VaultEntity) {
  return vault.status === 'active';
}

export function isVaultPaused(vault: VaultEntity) {
  return vault.status === 'paused';
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
    return ['viability', 'ren-sunset'].includes(vault.pauseReason);
  }

  return true;
}

export type VaultEntity = VaultStandard | VaultGov | VaultCowcentrated;
