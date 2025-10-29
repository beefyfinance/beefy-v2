import { isCowcentratedLikeVault, type VaultEntity } from '../../entities/vault.ts';

export function maybeHasStellaSwapRewards(vault: VaultEntity): boolean {
  return vault.chainId === 'moonbeam' && vault.platformId === 'stellaswap';
}

export function maybeHasMerklRewards(vault: VaultEntity): boolean {
  // note: additionally non-clm vaults on mode
  return isCowcentratedLikeVault(vault) || vault.chainId === 'mode';
}
