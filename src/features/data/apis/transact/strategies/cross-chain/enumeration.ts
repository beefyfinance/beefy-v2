import { isFulfilledResult, isRejectedResult } from '../../../../../../helpers/promises.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { selectUserDepositedVaultIds } from '../../../../selectors/balance.ts';
import {
  selectVaultById,
  selectVaultIdsByChainIdIncludingHidden,
} from '../../../../selectors/vaults.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { getUSDCForChain } from '../../cctp/CCTPProvider.ts';
import {
  isCrossChainHopEligible,
  userHasPositionIn,
  vaultAcceptsTokenDeposit,
  vaultCanWithdrawToToken,
} from './eligibility.ts';

// Per-vault eligibility checks construct strategy instances and consult the swap aggregator

export type VaultCandidate = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
};

/**
 * Candidate src vaults for a vault-to-vault deposit: scan user's deposited vaults on other
 * CCTP chains whose underlying can withdraw to the bridge token.
 */
export async function enumerateSrcVaultCandidates(
  destVaultId: VaultEntity['id'],
  state: BeefyState,
  walletAddress: string | undefined,
  allowedChains: ReadonlySet<ChainEntity['id']>
): Promise<VaultCandidate[]> {
  if (!walletAddress) return [];
  const destVault = selectVaultById(state, destVaultId);
  if (!destVault) return [];

  const userVaultIds = selectUserDepositedVaultIds(state, walletAddress);
  const survivors: { vaultId: VaultEntity['id']; chainId: ChainEntity['id'] }[] = [];
  for (const vaultId of userVaultIds) {
    if (vaultId === destVaultId) continue;
    const vault = selectVaultById(state, vaultId);
    if (!vault) continue;
    if (!allowedChains.has(vault.chainId)) continue;
    if (!isCrossChainHopEligible(destVault.chainId, vault.chainId)) continue;
    if (!userHasPositionIn(vaultId, state, walletAddress)) continue;
    survivors.push({ vaultId, chainId: vault.chainId });
  }

  const verdicts = await Promise.allSettled(
    survivors.map(({ vaultId, chainId }) =>
      vaultCanWithdrawToToken(vaultId, state, getUSDCForChain(chainId, state))
    )
  );
  const rejected = verdicts.flatMap((v, i) =>
    isRejectedResult(v) ? [{ vaultId: survivors[i].vaultId, reason: v.reason }] : []
  );
  if (rejected.length) {
    console.warn(
      `[cross-chain/enumerateSrc] ${rejected.length}/${survivors.length} rejected`,
      rejected
    );
  }
  return verdicts.flatMap((v, i) => (isFulfilledResult(v) && v.value ? [survivors[i]] : []));
}

/**
 * Candidate dst vaults for a vault-to-vault withdraw: scan active vaults on every
 * supported chain other than src that accept the bridge token as deposit.
 */
export async function enumerateDstVaultCandidates(
  srcVaultId: VaultEntity['id'],
  state: BeefyState,
  allowedChains: ReadonlySet<ChainEntity['id']>
): Promise<VaultCandidate[]> {
  const srcVault = selectVaultById(state, srcVaultId);
  if (!srcVault) return [];

  const survivors: VaultCandidate[] = [];
  for (const chainId of allowedChains) {
    if (!isCrossChainHopEligible(srcVault.chainId, chainId)) continue;
    const vaultIds = selectVaultIdsByChainIdIncludingHidden(state, chainId);
    for (const vaultId of vaultIds) {
      survivors.push({ vaultId, chainId });
    }
  }

  const verdicts = await Promise.allSettled(
    survivors.map(({ vaultId, chainId }) =>
      vaultAcceptsTokenDeposit(vaultId, state, getUSDCForChain(chainId, state))
    )
  );
  const rejected = verdicts.flatMap((v, i) =>
    isRejectedResult(v) ? [{ vaultId: survivors[i].vaultId, reason: v.reason }] : []
  );
  if (rejected.length) {
    console.warn(
      `[cross-chain/enumerateDst] ${rejected.length}/${survivors.length} rejected`,
      rejected
    );
  }
  return verdicts.flatMap((v, i) => (isFulfilledResult(v) && v.value ? [survivors[i]] : []));
}
