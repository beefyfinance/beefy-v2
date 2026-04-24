import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { isVaultActive } from '../../../../entities/vault.ts';
import { selectUserVaultBalanceInShareTokenIncludingDisplaced } from '../../../../selectors/balance.ts';
import { selectVaultById } from '../../../../selectors/vaults.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { isChainSupported } from '../../cctp/CCTPProvider.ts';

/**
 * Synchronous eligibility predicates used during enumeration to decide whether
 * a given vault can participate in a vault-to-vault zap. Each predicate takes
 * an explicit bridge token (the intermediate the orchestrator will route
 * through), so the helpers work for both cross-chain (USDC via CCTP today) and
 * same-chain orchestrators picking a different intermediate.
 *
 * The predicates run O(1) per vault, relying on cached state only (no network
 * calls), so enumeration can cheaply scan all chains × all vaults.
 *
 * The predicates are conservative approximations: they accept a vault iff its
 * deposit token resolves through a path we trust can be served via the
 * existing composable strategies. Option-building at runtime is the final
 * authority — if a candidate slips through here but no option can be built at
 * quote time, the quote throws cleanly and the UI surfaces the failure.
 */

/**
 * Can the vault's deposit token be reached from the supplied bridge token on
 * its chain?
 *
 * Accepted when:
 * - Vault is active (not EOL/paused).
 * - Vault's deposit token IS the bridge token (direct 1:1 deposit), OR
 * - Vault has at least one zap strategy configured (a composable strategy may
 *   route bridge token → deposit token; confirmed at quote time).
 */
export function vaultAcceptsBridgeTokenDeposit(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  bridgeToken: TokenEntity
): boolean {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return false;
  if (!isVaultActive(vault)) return false;
  if (!('depositTokenAddress' in vault)) return false;

  if (vault.depositTokenAddress.toLowerCase() === bridgeToken.address.toLowerCase()) return true;

  return (vault.zaps?.length ?? 0) > 0;
}

/**
 * Can the vault's share token be withdrawn to the supplied bridge token on its
 * chain?
 *
 * Same acceptance shape as {@link vaultAcceptsBridgeTokenDeposit}. EOL vaults
 * are still allowed because users may want to exit them via the bridge; that's
 * the one divergence from the deposit predicate.
 */
export function vaultCanWithdrawToBridgeToken(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  bridgeToken: TokenEntity
): boolean {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return false;
  if (!('depositTokenAddress' in vault)) return false;

  if (vault.depositTokenAddress.toLowerCase() === bridgeToken.address.toLowerCase()) return true;

  return (vault.zaps?.length ?? 0) > 0;
}

/**
 * Does the user hold a positive share balance in the given vault?
 * Uses the balance selector that includes displaced (boosted/bridged) shares
 * so src-vault candidates surface even when the user is currently staking.
 */
export function userHasPositionIn(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  walletAddress: string | undefined
): boolean {
  if (!walletAddress) return false;
  const shares: BigNumber = selectUserVaultBalanceInShareTokenIncludingDisplaced(
    state,
    vaultId,
    walletAddress
  );
  return shares.gt(BIG_ZERO);
}

/**
 * Is the supplied chain a candidate for cross-chain hop with the given page
 * chain? Guards against same-chain (handled at orchestrator entry) and
 * non-CCTP chains in one place so callers don't duplicate the check.
 */
export function isCrossChainHopEligible(
  pageChainId: ChainEntity['id'],
  otherChainId: ChainEntity['id']
): boolean {
  if (pageChainId === otherChainId) return false;
  return isChainSupported(otherChainId);
}
