import { BoostConfig, VaultConfig } from '../apis/config';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';

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

  // for LPs, the true token id is in the vault config
  if (apiBoost.earnedOracle === 'lps') {
    tokenId = apiBoost.earnedOracleId;
  }
  return tokenId;
}

export function getOracleTokenFromLegacyVaultConfig(chain: ChainEntity, apiVault: VaultConfig) {
  let token: TokenEntity;
  if (apiVault.tokenAddress) {
    token = {
      id: apiVault.oracleId,
      chainId: chain.id,
      contractAddress: apiVault.tokenAddress,
      decimals: apiVault.tokenDecimals,
      symbol: apiVault.token,
      buyUrl: null,
      description: null,
      website: null,
      type: 'erc20',
    };
  } else {
    token = {
      id: chain.walletSettings.nativeCurrency.symbol,
      chainId: chain.id,
      address: null,
      decimals: chain.walletSettings.nativeCurrency.decimals,
      symbol: chain.walletSettings.nativeCurrency.symbol,
      buyUrl: null,
      description: null,
      website: null,
      type: 'native',
    };
  }
  return token;
}
