import type { ChainId } from '../entities/chain.ts';
import type { TokenErc20 } from '../entities/token.ts';
import type { BoostConfig, VaultConfig } from '../apis/config-types.ts';

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

export function getBoostTokenAddressFromLegacyConfig(apiBoost: BoostConfig) {
  return apiBoost.earnedTokenAddress;
}

/**
 * Get the deposit token from a legacy vault config if it is an ERC20
 * @dev we do not need to native token as it will be added to state from the chain config
 */
export function getDepositTokenFromLegacyVaultConfig(
  chainId: ChainId,
  vaultConfig: VaultConfig
): TokenErc20 | undefined {
  if (vaultConfig.tokenAddress) {
    return {
      id: vaultConfig.token,
      chainId,
      oracleId: vaultConfig.oracleId,
      address:
        vaultConfig.type === 'cowcentrated' ?
          vaultConfig.tokenAddress + '-' + vaultConfig.id
        : vaultConfig.tokenAddress,
      decimals: vaultConfig.tokenDecimals,
      symbol: vaultConfig.token,
      providerId: vaultConfig.tokenProviderId,
      buyUrl: undefined,
      description: undefined,
      website: undefined,
      type: 'erc20',
      documentation: undefined,
      risks: [],
    };
  }

  return undefined;
}
