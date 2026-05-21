import { isFulfilledResult, isRejectedResult } from '../../../../../../helpers/promises.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import { isVaultActive, type VaultEntity } from '../../../../entities/vault.ts';
import { selectUserDepositedVaultIds } from '../../../../selectors/balance.ts';
import {
  selectVaultById,
  selectVaultIdsByChainIdIncludingHidden,
} from '../../../../selectors/vaults.ts';
import type { BeefyState } from '../../../../store/types.ts';
import {
  userHasPositionIn,
  vaultAcceptsTokenDeposit,
  vaultCanWithdrawToToken,
} from '../cross-chain/eligibility.ts';

export type SameChainVaultCandidate = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
};

export async function enumerateSameChainSrcCandidates(
  destVaultId: VaultEntity['id'],
  state: BeefyState,
  walletAddress: string | undefined,
  routingToken: TokenEntity
): Promise<SameChainVaultCandidate[]> {
  if (!walletAddress) return [];
  const destVault = selectVaultById(state, destVaultId);
  if (!destVault) return [];

  const userVaultIds = selectUserDepositedVaultIds(state, walletAddress);
  const survivors: SameChainVaultCandidate[] = [];
  for (const vaultId of userVaultIds) {
    if (vaultId === destVaultId) continue;
    const vault = selectVaultById(state, vaultId);
    if (!vault) continue;
    if (vault.chainId !== destVault.chainId) continue;
    if (!userHasPositionIn(vaultId, state, walletAddress)) continue;
    survivors.push({ vaultId, chainId: vault.chainId });
  }

  const verdicts = await Promise.allSettled(
    survivors.map(({ vaultId }) => vaultCanWithdrawToToken(vaultId, state, routingToken))
  );
  const rejected = verdicts.flatMap((v, i) =>
    isRejectedResult(v) ? [{ vaultId: survivors[i].vaultId, reason: v.reason }] : []
  );
  if (rejected.length) {
    console.warn(
      `[v2v/enumerateSrc] ${rejected.length}/${survivors.length} rejected for routing token ${routingToken.address}`,
      rejected
    );
  }
  return verdicts.flatMap((v, i) => (isFulfilledResult(v) && v.value ? [survivors[i]] : []));
}

export async function enumerateSameChainDstCandidates(
  srcVaultId: VaultEntity['id'],
  state: BeefyState,
  routingToken: TokenEntity
): Promise<SameChainVaultCandidate[]> {
  const srcVault = selectVaultById(state, srcVaultId);
  if (!srcVault) return [];

  const vaultIds = selectVaultIdsByChainIdIncludingHidden(state, srcVault.chainId);
  const survivors: SameChainVaultCandidate[] = [];
  for (const vaultId of vaultIds) {
    if (vaultId === srcVaultId) continue;
    const vault = selectVaultById(state, vaultId);
    if (!vault || !isVaultActive(vault)) continue;
    survivors.push({ vaultId, chainId: srcVault.chainId });
  }

  const verdicts = await Promise.allSettled(
    survivors.map(({ vaultId }) => vaultAcceptsTokenDeposit(vaultId, state, routingToken))
  );
  const rejected = verdicts.flatMap((v, i) =>
    isRejectedResult(v) ? [{ vaultId: survivors[i].vaultId, reason: v.reason }] : []
  );
  if (rejected.length) {
    console.warn(
      `[v2v/enumerateDst] ${rejected.length}/${survivors.length} rejected for routing token ${routingToken.address}`,
      rejected
    );
  }
  return verdicts.flatMap((v, i) => (isFulfilledResult(v) && v.value ? [survivors[i]] : []));
}
