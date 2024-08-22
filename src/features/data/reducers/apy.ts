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
import { selectTokenByAddress, selectTokenPriceByAddress } from '../selectors/tokens';
import { selectVaultById, selectVaultPricePerFullShare } from '../selectors/vaults';
import { createIdMap } from '../utils/array-utils';
import { mooAmountToOracleAmount } from '../utils/ppfs';
import { BIG_ONE } from '../../../helpers/big-number';
import type { BigNumber } from 'bignumber.js';
import { getBoostStatusFromContractState } from './boosts';
import type { ApiApyData } from '../apis/beefy/beefy-api-types';

// boost is expressed as APR
interface AprData {
  apr: number;
}

// TODO: this should be reworked
export interface TotalApy {
  totalApy: number;
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
}

type ExtractAprComponents<T extends string> = T extends `${infer C}Apr` ? C : never;
export type TotalApyKey = keyof TotalApy;
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

  for (const boostContractData of contractData.boosts) {
    const boost = selectBoostById(state, boostContractData.id);
    const vault = selectVaultById(state, boost.vaultId);
    // we can't use the selectIsBoostActiveOrPreStake selector here as state is not updated yet
    const boostStatus = getBoostStatusFromContractState(boost.id, boostContractData);
    const isBoostActiveOrPrestake = boostStatus === 'active' || boostStatus === 'prestake';
    // boost is expired
    if (!isBoostActiveOrPrestake) {
      // removing existing if it exists
      delete sliceState.rawApy.byBoostId[boost.id];
      continue;
    }

    /**
     * Some boosts can yield rewards in mooToken, be it from the same vault
     * or for another vault (like binSPIRIT) and some boost yield rewards as another
     * unrelated token (like PAE). When the boost is a mooToken, we don't have the
     * token price in the api so we need to compute it.
     **/
    let earnedPrice: BigNumber;
    const rewardTargetVaultId =
      state.entities.vaults.byChainId[boost.chainId]?.byType.standard.byAddress[
        boost.earnedTokenAddress.toLowerCase()
      ];
    if (rewardTargetVaultId) {
      const rewardTargetVault = selectVaultById(state, rewardTargetVaultId);
      const rewardVaultOraclePrice = selectTokenPriceByAddress(
        state,
        boost.chainId,
        rewardTargetVault.depositTokenAddress
      );
      const depositToken = selectTokenByAddress(
        state,
        boost.chainId,
        rewardTargetVault.depositTokenAddress
      );
      const earnedToken = selectTokenByAddress(state, boost.chainId, boost.earnedTokenAddress);

      // use the latest ppfs if any, otherwise fetch it in the previous state
      const ppfs =
        vaultDataByVaultId[rewardTargetVault.id]?.pricePerFullShare ||
        selectVaultPricePerFullShare(state, rewardTargetVault.id);

      // so the price rate is the oracle token price by the rate of the conversion to mooToken
      const mooToOracleRate = mooAmountToOracleAmount(earnedToken, depositToken, ppfs, BIG_ONE);
      earnedPrice = mooToOracleRate.times(rewardVaultOraclePrice);
    } else {
      // if we don't have a matching vault, it should be a yield from a token that has a price
      earnedPrice = selectTokenPriceByAddress(state, boost.chainId, boost.earnedTokenAddress);
    }

    const stakedTokenPrice = selectTokenPriceByAddress(
      state,
      vault.chainId,
      vault.depositTokenAddress
    );

    const ppfs =
      vaultDataByVaultId[boost.vaultId]?.pricePerFullShare ||
      selectVaultPricePerFullShare(state, boost.vaultId);
    const totalStakedInUsd = boostContractData.totalSupply.times(stakedTokenPrice).times(ppfs);
    const yearlyRewardsInUsd = boostContractData.rewardRate
      .times(3600 * 24 * 365)
      .times(earnedPrice);

    const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).toNumber();

    // add data to state
    sliceState.rawApy.byBoostId[boost.id] = { apr };
  }
}
