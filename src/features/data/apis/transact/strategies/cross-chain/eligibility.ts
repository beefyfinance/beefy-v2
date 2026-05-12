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

// Mirror of vaultAcceptsBridgeTokenDeposit minus the active check — EOL vaults are still allowed to exit via the bridge.
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

// Includes displaced (boosted/bridged) shares so src-vault candidates surface even when the user is currently staking.
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

export function isCrossChainHopEligible(
  pageChainId: ChainEntity['id'],
  otherChainId: ChainEntity['id']
): boolean {
  if (pageChainId === otherChainId) return false;
  return isChainSupported(otherChainId);
}
