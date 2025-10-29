import { fromWei } from '../../../../helpers/big-number.ts';
import { pushOrSet } from '../../../../helpers/object.ts';
import { getStellaSwapRewardsApi } from '../../apis/instances.ts';
import { getCowcentratedPool, isCowcentratedLikeVault } from '../../entities/vault.ts';
import type { StellaSwapVaultReward } from '../../reducers/wallet/user-rewards-types.ts';
import {
  selectGovCowcentratedVaultById,
  selectVaultByIdOrUndefined,
} from '../../selectors/vaults.ts';
import { isDefined } from '../../utils/array-utils.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import type {
  FetchUserStellaSwapRewardsActionParams,
  FetchUserStellaSwapRewardsFulfilledPayload,
} from './stellaswap-user-rewards-types.ts';
import { selectStellaSwapRewardsForUserShouldLoad } from '../../selectors/data-loader/user-rewards.ts';
import { maybeHasStellaSwapRewards } from './helpers.ts';
import { selectUserDepositedVaultIds } from '../../selectors/balance.ts';

export const fetchUserStellaSwapRewardsAction = createAppAsyncThunk<
  FetchUserStellaSwapRewardsFulfilledPayload,
  FetchUserStellaSwapRewardsActionParams
>(
  'rewards/fetchUserStellaSwapRewardsAction',
  async ({ walletAddress }, { getState }) => {
    const state = getState();
    const byVaultId: Record<string, StellaSwapVaultReward[]> = {};
    const depositedVaultIds = selectUserDepositedVaultIds(state, walletAddress);
    const poolAddressToClmPoolId: Record<string, string> = Object.fromEntries(
      depositedVaultIds
        .map(id => selectVaultByIdOrUndefined(state, id))
        .filter(isDefined)
        .filter(isCowcentratedLikeVault)
        .map(vault => {
          const poolId = getCowcentratedPool(vault);
          if (!poolId) {
            return undefined;
          }
          const pool = selectGovCowcentratedVaultById(state, poolId);
          if (!pool) {
            return undefined;
          }
          if (!maybeHasStellaSwapRewards(pool)) {
            return undefined;
          }
          return [vault.poolAddress.toLowerCase(), poolId];
        })
        .filter(isDefined)
    );

    if (Object.keys(poolAddressToClmPoolId).length === 0) {
      return {
        walletAddress,
        byVaultId,
      };
    }

    const api = await getStellaSwapRewardsApi();
    const response = await api.fetchRewards({
      user: walletAddress,
    });
    if (!response || response.status !== 'success' || !response.data) {
      throw new Error('Failed to fetch StellaSwap rewards');
    }

    for (const poolData of response.data.pools) {
      const vaultId = poolAddressToClmPoolId[poolData.pool.toLowerCase()];
      if (!vaultId) {
        console.error(`StellaSwap: Failed to find CLM Pool for ${poolData.pool}`);
        continue;
      }
      const vault = selectGovCowcentratedVaultById(state, vaultId);

      for (const rewardToken of poolData.rewardTokens) {
        if (rewardToken.amount === '0') {
          continue;
        }

        const rewardInfo = poolData.rewardInfo.find(info => info.token === rewardToken.address);
        if (!rewardInfo) {
          console.error(`StellaSwap: Failed to find reward info for ${rewardToken.address}`);
          continue;
        }
        const rewardDecimals = parseInt(rewardInfo.decimals);
        const reward = {
          position: rewardToken.position,
          proofs: rewardToken.proofs,
          accumulated: fromWei(rewardToken.amount, rewardDecimals),
          unclaimed: fromWei(rewardToken.pending, rewardDecimals),
          isNative: rewardToken.isNative,
          claimContractAddress: poolData.rewarder,
          token: {
            address: rewardToken.address,
            chainId: vault.chainId,
            decimals: rewardDecimals,
            symbol: rewardInfo.symbol,
          },
        };

        // Add reward to the vault
        pushOrSet(byVaultId, vaultId, reward);
      }
    }

    return {
      walletAddress,
      byVaultId,
    };
  },
  {
    condition({ walletAddress, force }, { getState }) {
      if (force) {
        return true;
      }
      return selectStellaSwapRewardsForUserShouldLoad(getState(), walletAddress);
    },
  }
);
