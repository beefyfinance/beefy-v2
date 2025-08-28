import { createCachedSelector } from 're-reselect';
import { isTokenErc20, type TokenErc20 } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { selectPlatformById } from './platforms.ts';
import { selectTokenByIdOrUndefined } from './tokens.ts';
import { selectVaultById } from './vaults.ts';

export const selectVaultHasAssetsWithRisks = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    const tokensWithRisks: TokenErc20[] = [];

    for (const tokenId of vault.assetIds) {
      const token = selectTokenByIdOrUndefined(state, vault.chainId, tokenId);

      if (token && isTokenErc20(token) && (token?.risks?.length || 0) > 0) {
        tokensWithRisks.push(token);
      }
    }

    return tokensWithRisks;
  },
  (tokensWithRisks: TokenErc20[]) => {
    if (tokensWithRisks.length >= 1) {
      return {
        risks: true,
        tokens: tokensWithRisks,
      };
    }

    // by default return false
    return {
      risks: false,
    };
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultHasPlatformWithRisks = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return selectPlatformById(state, vault.platformId);
  },
  platform => {
    if ((platform?.risks?.length || 0) > 0) {
      return {
        risks: true,
        platform,
      };
    } else {
      return { risks: false, platform };
    }
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
