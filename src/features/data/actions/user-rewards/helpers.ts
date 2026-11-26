import { isCowcentratedLikeVault, type VaultEntity } from '../../entities/vault.ts';

export function maybeHasMerklRewards(vault: VaultEntity): boolean {
  return isCowcentratedLikeVault(vault);
}
