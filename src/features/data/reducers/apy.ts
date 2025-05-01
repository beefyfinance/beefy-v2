import { createSlice } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { isAfter } from 'date-fns';
import type { Draft } from 'immer';
import type { BeefyState } from '../../../redux-types.ts';
import {
  fetchApyAction,
  fetchAvgApyAction,
  recalculateAvgApyAction,
  recalculateTotalApyAction,
} from '../actions/apy.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import { selectBoostById } from '../selectors/boosts.ts';
import { selectTokenPriceByAddress, selectVaultReceiptTokenPrice } from '../selectors/tokens.ts';
import { selectVaultWithReceiptByAddressOrUndefined } from '../selectors/vaults.ts';
import { createIdMap } from '../utils/array-utils.ts';
import type { ApyState, BoostAprData } from './apy-types.ts';
import { getBoostStatusFromContractState } from './promos.ts';

export const initialApyState: ApyState = {
  rawApy: { byVaultId: {}, byBoostId: {} },
  totalApy: { byVaultId: {} },
  rawAvgApy: { byVaultId: {} },
  avgApy: { byVaultId: {} },
};

export const apySlice = createSlice({
  name: 'apy',
  initialState: initialApyState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder
      .addCase(fetchApyAction.fulfilled, (sliceState, action) => {
        for (const [vaultId, apy] of Object.entries(action.payload.data)) {
          sliceState.rawApy.byVaultId[vaultId] = apy;
        }
      })
      .addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
        const state = action.payload.state;
        addContractDataToState(state, sliceState, action.payload.data);
      })
      .addCase(
        reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
        (sliceState, action) => {
          const state = action.payload.state;
          addContractDataToState(state, sliceState, action.payload.contractData);
        }
      )
      .addCase(recalculateTotalApyAction.fulfilled, (sliceState, action) => {
        sliceState.totalApy.byVaultId = action.payload.totals;
      })
      .addCase(fetchAvgApyAction.fulfilled, (sliceState, action) => {
        sliceState.rawAvgApy.byVaultId = action.payload.data;
      })
      .addCase(recalculateAvgApyAction.fulfilled, (sliceState, action) => {
        sliceState.avgApy.byVaultId = action.payload.data;
      });
  },
});

function addContractDataToState(
  state: BeefyState,
  sliceState: Draft<ApyState>,
  contractData: FetchAllContractDataResult
) {
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
      delete sliceState.rawApy.byBoostId[boost.id];
      continue;
    }

    // only active rewards
    const activeRewards = boostContractData.rewards.filter(
      r => r.periodFinish && isAfter(r.periodFinish, now) && r.rewardRate.gt(0)
    );
    if (!activeRewards.length) {
      delete sliceState.rawApy.byBoostId[boost.id];
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

    // add data to state
    sliceState.rawApy.byBoostId[boost.id] = boostAprData;
  }
}
