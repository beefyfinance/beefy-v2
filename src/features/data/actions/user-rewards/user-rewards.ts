import { isCowcentratedLikeVault, type VaultEntity } from '../../entities/vault';
import type { BeefyDispatchFn, BeefyStateFn, BeefyThunk } from '../../../../redux-types';
import { fetchUserStellaSwapRewardsAction } from './stellaswap-user-rewards';
import { fetchUserMerklRewardsAction } from './merkl-user-rewards';
import { selectUserDepositedVaultIds } from '../../selectors/balance';
import { selectVaultById } from '../../selectors/vaults';
import { PromiseSettledAwaiter } from '../../../../helpers/promises';

function maybeHasStellaSwapRewards(vault: VaultEntity): boolean {
  return vault.chainId === 'moonbeam' && vault.platformId === 'stellaswap';
}

function maybeHasMerklRewards(vault: VaultEntity): boolean {
  return isCowcentratedLikeVault(vault);
}

export function fetchUserOffChainRewardsForVaultAction(
  vaultId: VaultEntity['id'],
  walletAddress: string
): BeefyThunk {
  return async function (dispatch: BeefyDispatchFn, getState: BeefyStateFn) {
    const vault = selectVaultById(getState(), vaultId);
    if (maybeHasMerklRewards(vault)) {
      dispatch(fetchUserMerklRewardsAction({ walletAddress }));
    }
    if (maybeHasStellaSwapRewards(vault)) {
      dispatch(fetchUserStellaSwapRewardsAction({ walletAddress }));
    }
  };
}

export function fetchUserOffChainRewardsForDepositedVaultsAction(walletAddress: string) {
  return async function (dispatch: BeefyDispatchFn, getState: BeefyStateFn) {
    const state = getState();
    const depositedVaultIds = selectUserDepositedVaultIds(state);
    let fetchMerkl: boolean = false;
    let fetchStellaSwap: boolean = false;

    for (const vaultId of depositedVaultIds) {
      const vault = selectVaultById(state, vaultId);
      if (!fetchMerkl && maybeHasMerklRewards(vault)) {
        fetchMerkl = true;
      }
      if (!fetchStellaSwap && maybeHasStellaSwapRewards(vault)) {
        fetchStellaSwap = true;
      }
      if (fetchMerkl && fetchStellaSwap) {
        break;
      }
    }

    const awaiter = new PromiseSettledAwaiter();
    if (fetchMerkl) {
      awaiter.add(dispatch(fetchUserMerklRewardsAction({ walletAddress })));
    }
    if (fetchStellaSwap) {
      awaiter.add(dispatch(fetchUserStellaSwapRewardsAction({ walletAddress })));
    }

    await awaiter.wait();
  };
}
