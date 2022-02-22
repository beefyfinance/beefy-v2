import { ChainEntity } from './chain';
import { PlatformEntity } from './platform';
import { TokenEntity } from './token';

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
  logoUri: string;

  /**
   * ASSETS are basically the assets that are in that vault
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assetIds: TokenEntity['id'][];

  chainId: ChainEntity['id'];

  /**
   * each vault has an underlying token which is what you stake in it we identify it with the oracleId
   *
   * "oracleId" is the technical token ID (like "pangolin-aave.e-wavax") used to uniquely
   * identify a token in all apis, and "token" is the name that should be displayed to
   * the user (like "AAVE.e-AVAXLP")
   **/
  oracleId: TokenEntity['id'];

  /**
   * "Earned" token is the token you get back for staking into a vault
   * Staking into a standard vault "earns" mooTokens
   */
  earnedTokenId: TokenEntity['id'];

  /**
   * The vault contract address
   */
  contractAddress: string;

  // for display purpose only
  strategyType: 'StratLP' | 'StratMultiLP' | 'Vamp' | 'Lending' | 'SingleStake' | 'Maxi';

  isGovVault: false;

  /**
   * The protocol this vault rely on (Curve, boo finance, etc)
   */
  platformId: PlatformEntity['id'];

  status: 'active' | 'eol' | 'paused';

  type: 'lps' | 'single';

  tags: VaultTag[];

  safetyScore: number;

  risks: string[];
}

export interface VaultGov {
  id: string;
  name: string;
  logoUri: string;

  /**
   * ASSETS are basically the assets that are in that vault
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assetIds: TokenEntity['id'][];

  chainId: ChainEntity['id'];

  /**
   * each vault has an underlying token which is what you stake in it we identify it with the oracleId
   *
   * "oracleId" is the technical token ID (like "pangolin-aave.e-wavax") used to uniquely
   * identify a token in all apis, and "token" is the name that should be displayed to
   * the user (like "AAVE.e-AVAXLP")
   **/
  oracleId: TokenEntity['id'];

  /**
   * "Earned" token is the token you get back for staking into a vault
   * Staking into a gov vault "earns" native tokens
   */
  earnedTokenId: TokenEntity['id'];

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

  tags: VaultTag[];

  type: 'single';

  safetyScore: number;

  risks: string[];
}

export function isGovVault(vault: VaultEntity): vault is VaultGov {
  return vault.isGovVault === true;
}

// Todo: make this the right way
export function isMaxiVault(vault: VaultEntity): vault is VaultStandard {
  return vault.id.endsWith('-maxi');
}

export function isVaultActive(vault: VaultEntity) {
  return vault.status === 'active';
}

export type VaultEntity = VaultStandard | VaultGov;
