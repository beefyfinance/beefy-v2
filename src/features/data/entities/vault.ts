import { TokenEntity, TokenImplem } from './token';

// maybe a RiskAnalysis type would be better
enum VaultRiskTag {
  // todo: we use strings for convenience right now but it takes a lot of memory space
  ALGO_STABLE = 'ALGO_STABLE',
  AUDIT = 'AUDIT',
  BATTLE_TESTED = 'BATTLE_TESTED',
  COMPLEXITY_HIGH = 'COMPLEXITY_HIGH',
  COMPLEXITY_LOW = 'COMPLEXITY_LOW',
  COMPLEXITY_MID = 'COMPLEXITY_MID',
  CONTRACTS_VERIFIED = 'CONTRACTS_VERIFIED',
  IL_HIGH = 'IL_HIGH',
  IL_LOW = 'IL_LOW',
  IL_NONE = 'IL_NONE',
  MCAP_HIGH = 'MCAP_HIGH',
  MCAP_LARGE = 'MCAP_LARGE',
  MCAP_LOW = 'MCAP_LOW',
  MCAP_MEDIUM = 'MCAP_MEDIUM',
  MCAP_MICRO = 'MCAP_MICRO',
  MCAP_MIRO = 'MCAP_MIRO',
  MCAP_SMALL = 'MCAP_SMALL',
  NEW_STRAT = 'NEW_STRAT',
  NO_AUDIT = 'NO_AUDIT',
  PLATFORM_ESTABLISHED = 'PLATFORM_ESTABLISHED',
}

enum VaultTag {
  BEEFY,
  BLUE_CHIP,
  LOW_RISK,
  BOOST,
}

/**
 * A vault is anything you can stake stuff into
 * - could be a single token vault
 * - could be an LP vault
 * - could be a bifi boost (gov vault)
 *
 * Sometimes also named "pool"
 */
interface VaultStandard {
  id: string;
  name: string;
  logoUri: string;

  /**
   * each vault has an underlying token which is what you stake in it we identify it with the oracleId
   *
   * "oracleId" is the technical token ID (like "pangolin-aave.e-wavax") used to uniquely
   * identify a token in all apis, and "token" is the name that should be displayed to
   * the user (like "AAVE.e-AVAXLP")
   **/
  oracleId: TokenImplem['id'];

  /**
   * "Earned" token is the token you get back for staking into a vault
   * Staking into a standard vault "earns" mooTokens
   */
  earnedToken: TokenImplem['id'];

  /**
   * pricePerFullShare is how you find out how much your mooTokens
   * (shares) represent in term of the underlying asset
   *
   * So if you deposit 1 BIFI you will get, for example 0.95 mooBIFI,
   * with a ppfs of X, if you multiply your mooBIIFI * ppfs you get your amount in BIFI
   *
   * That value is fetched from the smart contract upon loading
   **/
  // todo: move this elsewhere
  pricePerFullShare: number;

  /**
   * ASSETS are basically the assets that are in that vault
   * So if you go into a BIFI vault, the assets is of course only BIFI
   * But if you join the curve aTriCrypto vault your assets will be BTC,ETH and USDT
   */
  assets: TokenEntity['id'][];

  // for display purpose only
  strategyType: 'StratLP' | 'StratMultiLP' | 'Vamp' | 'Lending' | 'SingleStake' | 'Maxi';

  // TODO: WIP
  tags: VaultTag[];
  safetyAnalysis: {
    score: number;
    audited: boolean; // maybe split for multiple audit or
    risks: VaultRiskTag[]; // maybe be smarter about it later?
  };
  fees: {
    depositFee: number;
    performanceFee: number;
    withdrawalFee: number;
  };
}

// TODO: WIP
interface VaultGov {
  id: string;
  tokens: {
    earnedToken: TokenEntity['id'];
    tokens: TokenEntity['id'][];
  };
}

// TODO: type guards

export type VaultEntity = VaultStandard | VaultGov;
