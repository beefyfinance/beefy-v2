import { ChainEntity } from './chain';
import { PlatformEntity } from './platform';
import { TokenEntity } from './token';
import { StrategyTypeEntity } from './strategy-type';

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
   * The vault contract address
   */
  earnContractAddress: string;

  strategyTypeId: StrategyTypeEntity['id'];

  isGovVault: false;

  /**
   * The protocol this vault rely on (Curve, boo finance, etc)
   */
  platformId: PlatformEntity['id'];

  status: 'active' | 'eol' | 'paused';

  type: 'lps' | 'single';

  safetyScore: number;

  risks: string[];

  buyTokenUrl: string | null;
  addLiquidityUrl: string | null;
  removeLiquidityUrl: string | null;

  depositFee: string | null;

  createdAt: number;

  retireReason?: string;
  pauseReason?: string;
}

export interface VaultGov {
  id: string;
  name: string;
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

  isGovVault: true;

  platformId: PlatformEntity['id'];

  status: 'active' | 'eol' | 'paused';

  type: 'single';

  safetyScore: number;

  risks: string[];

  buyTokenUrl: string | null;
  addLiquidityUrl: null;
  removeLiquidityUrl: null;

  depositFee: string;

  createdAt: number;

  retireReason?: string;
  pauseReason?: string;
}

export function isGovVault(vault: VaultEntity): vault is VaultGov {
  return vault.isGovVault === true;
}

export function isStandardVault(vault: VaultEntity): vault is VaultStandard {
  return vault.isGovVault === false;
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

export type VaultEntity = VaultStandard | VaultGov;
