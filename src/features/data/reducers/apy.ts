import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import type { BeefyState } from '../../../redux-types';
import { fetchApyAction, recalculateTotalApyAction } from '../actions/apy';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import type { BoostEntity } from '../entities/boost';
import type { VaultEntity } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectTokenPriceByAddress, selectVaultReceiptTokenPrice } from '../selectors/tokens';
import { selectStandardVaultByAddressOrUndefined } from '../selectors/vaults';
import { createIdMap } from '../utils/array-utils';
import type { BigNumber } from 'bignumber.js';
import { getBoostStatusFromContractState } from './boosts';
import type { ApiApyData } from '../apis/beefy/beefy-api-types';
import { isAfter } from 'date-fns';

// boost is expressed as APR
interface AprData {
  apr: number;
}

// TODO: this should be reworked
export interface TotalApy {
  totalApy: number;
  totalType: 'apy' | 'apr';
  totalMonthly: number;
  totalDaily: number;
  vaultApr?: number;
  vaultDaily?: number;
  tradingApr?: number;
  tradingDaily?: number;
  composablePoolApr?: number;
  composablePoolDaily?: number;
  liquidStakingApr?: number;
  liquidStakingDaily?: number;
  boostApr?: number;
  boostDaily?: number;
  boostedTotalApy?: number;
  boostedTotalDaily?: number;
  clmApr?: number;
  clmDaily?: number;
  merklApr?: number;
  merklDaily?: number;
  stellaSwapApr?: number;
  stellaSwapDaily?: number;
  rewardPoolApr?: number;
  rewardPoolDaily?: number;
  rewardPoolTradingApr?: number;
  rewardPoolTradingDaily?: number;
  merklBoostApr?: number;
  merklBoostDaily?: number;
}

type ExtractAprComponents<T extends string> = T extends `${infer C}Apr` ? C : never;
export type TotalApyKey = Exclude<keyof TotalApy, 'totalType'>;
export type TotalApyComponent = ExtractAprComponents<TotalApyKey>;
export type TotalApyYearlyComponent = `${TotalApyComponent}Apr`;
export type TotalApyDailyComponent = `${TotalApyComponent}Daily`;

/**
 * State containing APY infos indexed by vault id
 */
export interface ApyState {
  rawApy: {
    byVaultId: {
      // we reuse the api types, not the best idea but works for now
      [vaultId: VaultEntity['id']]: ApiApyData;
    };
    byBoostId: {
      [boostId: BoostEntity['id']]: AprData;
    };
  };
  totalApy: {
    byVaultId: {
      // we reuse the api types, not the best idea but works for now
      [vaultId: VaultEntity['id']]: TotalApy;
    };
  };
}

export const initialApyState: ApyState = {
  rawApy: { byVaultId: {}, byBoostId: {} },
  totalApy: { byVaultId: {} },
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
    const boostStatus = getBoostStatusFromContractState(boost.id, boostContractData);
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
    const totalApr = activeRewards.reduce((acc, reward) => {
      // Rewards
      let rewardTokenPrice: BigNumber;
      const rewardVault = selectStandardVaultByAddressOrUndefined(
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

      return isNaN(apr) ? acc : acc + apr;
    }, 0);

    // add data to state
    sliceState.rawApy.byBoostId[boost.id] = { apr: totalApr };
  }
}
