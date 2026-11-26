import { type VaultEntity } from '../../entities/vault.ts';
import { selectUserDepositedVaultIds } from '../../selectors/balance.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import type { BeefyDispatchFn, BeefyStateFn, BeefyThunk } from '../../store/types.ts';
import { fetchUserMerklRewardsAction } from './merkl-user-rewards.ts';
import { maybeHasMerklRewards } from './helpers.ts';

export function fetchUserOffChainRewardsForVaultAction(
  vaultId: VaultEntity['id'],
  walletAddress: string
): BeefyThunk {
  return async function (dispatch, getState) {
    const vault = selectVaultById(getState(), vaultId);
    if (maybeHasMerklRewards(vault)) {
      dispatch(fetchUserMerklRewardsAction({ walletAddress }));
    }
  };
}

export function fetchUserOffChainRewardsForDepositedVaultsAction(walletAddress: string) {
  return async function (dispatch: BeefyDispatchFn, getState: BeefyStateFn) {
    const state = getState();
    const depositedVaultIds = selectUserDepositedVaultIds(state, walletAddress);
    const fetchMerkl = depositedVaultIds.some(vaultId =>
      maybeHasMerklRewards(selectVaultById(state, vaultId))
    );

    if (fetchMerkl) {
      await Promise.allSettled([dispatch(fetchUserMerklRewardsAction({ walletAddress }))]);
    }
  };
}
