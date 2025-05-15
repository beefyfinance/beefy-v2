import { isCowcentratedLikeVault, type VaultEntity } from '../../entities/vault.ts';
import { selectUserDepositedVaultIds } from '../../selectors/balance.ts';
import { selectVaultById } from '../../selectors/vaults.ts';
import type { BeefyDispatchFn, BeefyStateFn, BeefyThunk } from '../../store/types.ts';
import { fetchUserMerklRewardsAction } from './merkl-user-rewards.ts';
import { fetchUserStellaSwapRewardsAction } from './stellaswap-user-rewards.ts';

function maybeHasStellaSwapRewards(vault: VaultEntity): boolean {
  return vault.chainId === 'moonbeam' && vault.platformId === 'stellaswap';
}

function maybeHasMerklRewards(vault: VaultEntity): boolean {
  return isCowcentratedLikeVault(vault) || vault.chainId === 'mode';
}

export function fetchUserOffChainRewardsForVaultAction(
  vaultId: VaultEntity['id'],
  walletAddress: string
): BeefyThunk {
  return async function (dispatch, getState) {
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

    const promises: Promise<unknown>[] = [];

    if (fetchMerkl) {
      promises.push(dispatch(fetchUserMerklRewardsAction({ walletAddress })));
    }
    if (fetchStellaSwap) {
      promises.push(dispatch(fetchUserStellaSwapRewardsAction({ walletAddress })));
    }

    if (promises.length > 0) {
      await Promise.allSettled(promises);
    }
  };
}
