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

/**
 * Output shape for both enumeration helpers: a vault id plus its chain so
 * callers don't have to re-resolve the vault just to learn where it lives.
 */
export type VaultCandidate = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
};

/**
 * Candidate src vaults for a vault-to-vault deposit: user holds balance in
 * vault X on chain A, wants to redeploy into `destVaultId` on chain B. We
 * scan the user's deposited vaults on other CCTP chains and keep the ones
 * whose underlying can be withdrawn to the bridge token.
 *
 * Pure function — no network I/O, safe to call during option emission even
 * across many chain pairs.
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
 * Candidate dst vaults for a vault-to-vault withdraw (Path C): user wants
 * to exit `srcVaultId` and redeploy into some vault on another CCTP chain.
 * We scan active vaults on every supported chain other than the src.
 *
 * Pure function — no network I/O. May return a long list on well-populated
 * chains; UI surfaces via paged/grouped selector (Phase 4).
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
