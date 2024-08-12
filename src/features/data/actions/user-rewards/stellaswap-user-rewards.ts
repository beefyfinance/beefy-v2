import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../../redux-types';
import { getStellaSwapRewardsApi } from '../../apis/instances';
import type { StellaSwapVaultReward } from '../../reducers/wallet/user-rewards-types';
import { selectCowcentratedLikeVaultById, selectVaultById } from '../../selectors/vaults';
import { fromWeiString } from '../../../../helpers/big-number';
import type {
  FetchUserStellaSwapRewardsActionParams,
  FetchUserStellaSwapRewardsFulfilledPayload,
} from './stellaswap-user-rewards-types';
import { isCowcentratedLikeVault } from '../../entities/vault';
import { pushOrSet } from '../../../../helpers/object';
import { selectStellaSwapRewardsForUserShouldLoad } from '../../selectors/data-loader';

export const fetchUserStellaSwapRewardsAction = createAsyncThunk<
  FetchUserStellaSwapRewardsFulfilledPayload,
  FetchUserStellaSwapRewardsActionParams,
  { state: BeefyState }
>(
  'rewards/fetchUserStellaSwapRewardsAction',
  async ({ walletAddress, vaultId }, { getState }) => {
    const state = getState();
    const api = await getStellaSwapRewardsApi();
    const vault = selectCowcentratedLikeVaultById(state, vaultId);

    const response = await api.fetchRewards({
      user: walletAddress,
      pool: vault.poolAddress,
    });

    if (!response || response.status !== 'success' || !response.data) {
      throw new Error('Failed to fetch StellaSwap rewards');
    }

    const byVaultId: Record<string, StellaSwapVaultReward[]> = {};
    response.data.rewardTokens.forEach(rewardToken => {
      if (rewardToken.amount === '0') {
        return;
      }

      const rewardInfo = response.data.rewardInfo.find(info => info.token === rewardToken.address);
      if (!rewardInfo) {
        console.error(`StellaSwap: Failed to find reward info for ${rewardToken.address}`);
        return;
      }
      const rewardDecimals = parseInt(rewardInfo.decimals);
      const reward = {
        position: rewardToken.position,
        proofs: rewardToken.proofs,
        accumulated: fromWeiString(rewardToken.amount, rewardDecimals),
        unclaimed: fromWeiString(rewardToken.pending, rewardDecimals),
        isNative: rewardToken.isNative,
        claimContractAddress: response.data.rewarder,
        token: {
          address: rewardToken.address,
          chainId: vault.chainId,
          decimals: rewardDecimals,
          symbol: rewardInfo.symbol,
        },
      };

      // Add reward to the vault
      pushOrSet(byVaultId, vaultId, reward);
    });

    return {
      walletAddress,
      byVaultId,
    };
  },
  {
    condition({ walletAddress, vaultId, force }, { getState }) {
      const state = getState();
      const vault = selectVaultById(state, vaultId);
      if (
        !isCowcentratedLikeVault(vault) ||
        vault.chainId !== 'moonbeam' ||
        vault.platformId !== 'stellaswap'
      ) {
        return false;
      }

      if (force) {
        return true;
      }
      return selectStellaSwapRewardsForUserShouldLoad(getState(), vaultId, walletAddress);
    },
  }
);
