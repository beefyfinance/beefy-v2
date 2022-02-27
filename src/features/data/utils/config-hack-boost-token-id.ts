import { BoostConfig } from '../apis/config';

/**
 * let tokenId = apiBoost.earnedOracleId;
  // for convenience, the config puts "BIFI" as oracle token of all mooXBIFI
  // but we need to distinguish those tokens
  if (
    tokenId === 'BIFI' &&
    apiBoost.earnedToken.startsWith('moo') &&
    apiBoost.earnedToken.endsWith('BIFI')
  ) {
    tokenId = apiBoost.earnedToken;
  }
 */
export function getBoostTokenIdFromLegacyConfig(apiBoost: BoostConfig) {
  let tokenId = apiBoost.earnedToken;
  if (
    !tokenId.startsWith('moo') &&
    !tokenId.includes('-') &&
    !tokenId.includes('_') &&
    !tokenId.includes('.') &&
    !tokenId.includes(' ') &&
    apiBoost.earnedToken !== apiBoost.earnedOracleId &&
    apiBoost.earnedToken.toLocaleUpperCase() === apiBoost.earnedOracleId.toLocaleUpperCase()
  ) {
    tokenId = apiBoost.earnedToken.toLocaleUpperCase();
  }
  return tokenId;
}
