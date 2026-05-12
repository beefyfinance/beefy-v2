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
  vaultAcceptsBridgeTokenDeposit,
  vaultCanWithdrawToBridgeToken,
} from './eligibility.ts';

export type VaultCandidate = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
};

/**
 * Candidate src vaults for a vault-to-vault deposit: scan user's deposited vaults on other
 * CCTP chains whose underlying can withdraw to the bridge token.
 */
export function enumerateSrcVaultCandidates(
  destVaultId: VaultEntity['id'],
  state: BeefyState,
  walletAddress: string | undefined,
  allowedChains: ReadonlySet<ChainEntity['id']>
): VaultCandidate[] {
  if (!walletAddress) return [];
  const destVault = selectVaultById(state, destVaultId);
  if (!destVault) return [];

  const candidates: VaultCandidate[] = [];
  const userVaultIds = selectUserDepositedVaultIds(state, walletAddress);
  for (const vaultId of userVaultIds) {
    if (vaultId === destVaultId) continue;
    const vault = selectVaultById(state, vaultId);
    if (!vault) continue;
    if (!allowedChains.has(vault.chainId)) continue;
    if (!isCrossChainHopEligible(destVault.chainId, vault.chainId)) continue;
    if (!userHasPositionIn(vaultId, state, walletAddress)) continue;
    const bridgeToken = getUSDCForChain(vault.chainId, state);
    if (!vaultCanWithdrawToBridgeToken(vaultId, state, bridgeToken)) continue;
    candidates.push({ vaultId, chainId: vault.chainId });
  }
  return candidates;
}

/**
 * Candidate dst vaults for a vault-to-vault withdraw: scan active vaults on every
 * supported chain other than src that accept the bridge token as deposit.
 */
export function enumerateDstVaultCandidates(
  srcVaultId: VaultEntity['id'],
  state: BeefyState,
  allowedChains: ReadonlySet<ChainEntity['id']>
): VaultCandidate[] {
  const srcVault = selectVaultById(state, srcVaultId);
  if (!srcVault) return [];

  const candidates: VaultCandidate[] = [];
  for (const chainId of allowedChains) {
    if (!isCrossChainHopEligible(srcVault.chainId, chainId)) continue;
    const bridgeToken = getUSDCForChain(chainId, state);
    const vaultIds = selectVaultIdsByChainIdIncludingHidden(state, chainId);
    for (const vaultId of vaultIds) {
      if (!vaultAcceptsBridgeTokenDeposit(vaultId, state, bridgeToken)) continue;
      candidates.push({ vaultId, chainId });
    }
  }
  return candidates;
}
