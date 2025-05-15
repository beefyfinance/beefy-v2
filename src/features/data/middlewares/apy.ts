import { isAnyOf } from '@reduxjs/toolkit';
import { isAfter } from 'date-fns';
import {
  fetchApyAction,
  fetchAvgApyAction,
  recalculateAvgApyAction,
  recalculateTotalApyAction,
} from '../actions/apy.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { fetchOffChainCampaignsAction } from '../actions/rewards.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import type { BoostAprData, RawAprByBoostId } from '../reducers/apy-types.ts';
import { setApyContractState } from '../reducers/apy.ts';
import { getBoostStatusFromContractState } from '../reducers/promos.ts';
import { selectIsApyAvailable, selectIsAvgApyAvailable } from '../selectors/apy.ts';
import { selectBoostById } from '../selectors/boosts.ts';
import { selectIsVaultsAvailable } from '../selectors/config.ts';
import { selectTokenPriceByAddress, selectVaultReceiptTokenPrice } from '../selectors/tokens.ts';
import { selectVaultWithReceiptByAddressOrUndefined } from '../selectors/vaults.ts';
import type { BeefyState } from '../store/types.ts';
import { createIdMap } from '../utils/array-utils.ts';
import { startAppListening } from './listener-middleware.ts';

const contractDataChanged = isAnyOf(
  fetchAllContractDataByChainAction.fulfilled.match,
  reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled.match
);

export function addApyListeners() {
  startAppListening({
    matcher: contractDataChanged,
    effect: async (action, { getState, dispatch }) => {
      // TODO this could probably be done in the original actions but we have delayed fulfills in initAppData
      const { contractData } = action.payload;
      const state = getState();
      const rawApyByBoostId = getBoostAprById(state, contractData);
      dispatch(setApyContractState({ rawApyByBoostId }));
    },
  });

  startAppListening({
    matcher: isAnyOf(
      setApyContractState,
      fetchApyAction.fulfilled.match,
      fetchAvgApyAction.fulfilled.match,
      fetchAllContractDataByChainAction.fulfilled.match,
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled.match,
      fetchOffChainCampaignsAction.fulfilled.match
    ),
    effect: async (_action, { dispatch, delay, cancelActiveListeners, condition }) => {
      // Cancel other instances of this callback
      cancelActiveListeners();

      // Debounce
      await delay(50);

      // Make sure we have vaults and raw apys
      await condition(
        (_action, currentState) =>
          selectIsVaultsAvailable(currentState) && selectIsApyAvailable(currentState)
      );

      // Compute total apy for frontend
      await dispatch(recalculateTotalApyAction());

      // Make sure we have avg apys
      await condition((_action, currentState) => selectIsAvgApyAvailable(currentState));

      // Compute average apy for frontend
      await dispatch(recalculateAvgApyAction());
    },
  });
}

function getBoostAprById(state: BeefyState, contractData: FetchAllContractDataResult) {
  const byBoostId: RawAprByBoostId = { ...state.biz.apy.rawApy.byBoostId };

  // create a quick access map
  const vaultDataByVaultId = createIdMap(contractData.standardVaults);
  const now = new Date();

  for (const boostContractData of contractData.boosts) {
    const boost = selectBoostById(state, boostContractData.id);
    // we can't use the selectIsBoostActiveOrPreStake selector here as state is not updated yet
    const boostStatus = getBoostStatusFromContractState(boostContractData);
    const isBoostActiveOrPrestake = boostStatus === 'active' || boostStatus === 'prestake';
    // boost is expired
    if (!isBoostActiveOrPrestake) {
      // removing existing if it exists
      delete byBoostId[boost.id];
      continue;
    }

    // only active rewards
    const activeRewards = boostContractData.rewards.filter(
      r => !!r.periodFinish && isAfter(r.periodFinish, now) && r.rewardRate.gt(0)
    );
    if (!activeRewards.length) {
      delete byBoostId[boost.id];
      continue;
    }

    // calculate total staked in USD
    const stakedTokenPrice = selectVaultReceiptTokenPrice(
      state,
      boost.vaultId,
      vaultDataByVaultId[boost.vaultId]?.pricePerFullShare
    );
    const totalStakedInUsd = boostContractData.totalSupply.times(stakedTokenPrice);

    // Sum apr from each active reward
    const boostAprData = activeRewards.reduce<BoostAprData>(
      (acc, reward) => {
        // Rewards
        let rewardTokenPrice: BigNumber;
        const rewardVault = selectVaultWithReceiptByAddressOrUndefined(
          state,
          reward.token.chainId,
          reward.token.address
        );
        if (rewardVault) {
          // if reward is a mooToken, we need to take account of PPFS
          rewardTokenPrice = selectVaultReceiptTokenPrice(
            state,
            rewardVault.id,
            vaultDataByVaultId[rewardVault.id]?.pricePerFullShare
          );
        } else {
          // if we don't have a matching vault, it should be a yield from a token that has a price
          rewardTokenPrice = selectTokenPriceByAddress(
            state,
            reward.token.chainId,
            reward.token.address
          );
        }
        const yearlyRewardsInUsd = reward.rewardRate.times(3600 * 24 * 365).times(rewardTokenPrice);
        const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).toNumber();

        // return isNaN(apr) ? acc : acc + apr;
        return {
          apr: isNaN(apr) ? acc.apr : acc.apr + apr,
          aprByRewardToken: [
            ...acc.aprByRewardToken,
            {
              rewardToken: reward.token.address,
              apr: isNaN(apr) ? 0 : apr,
            },
          ],
        };
      },
      { apr: 0, aprByRewardToken: [] }
    );

    byBoostId[boost.id] = boostAprData;
  }

  return byBoostId;
}
