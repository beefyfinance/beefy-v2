import type { PlatformEntity } from '../entities/platform.ts';
import { isTokenErc20, type TokenErc20 } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { selectPlatformById } from './platforms.ts';
import { selectTokenByIdOrUndefined } from './tokens.ts';
import { selectVaultById } from './vaults.ts';

export const selectVaultHasAssetsWithRisks = (
  state: BeefyState,
  vaultId: VaultEntity['id']
):
  | {
      risks: false;
    }
  | {
      risks: true;
      tokens: TokenErc20[];
    } => {
  const vault = selectVaultById(state, vaultId);

  const tokensWithRisks: TokenErc20[] = [];

  for (const tokenId of vault.assetIds) {
    const token = selectTokenByIdOrUndefined(state, vault.chainId, tokenId);

    if (token && isTokenErc20(token) && (token?.risks?.length || 0) > 0) {
      tokensWithRisks.push(token);
    }
  }

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
};
export const selectVaultHasPlatformWithRisks = (
  state: BeefyState,
  vaultId: VaultEntity['id']
):
  | {
      risks: false;
    }
  | {
      risks: true;
      platform: PlatformEntity;
    } => {
  const vault = selectVaultById(state, vaultId);

  const platform = selectPlatformById(state, vault.platformId);

  if ((platform?.risks?.length || 0) > 0) {
    return {
      risks: true,
      platform,
    };
  } else {
    return { risks: false };
  }
};
