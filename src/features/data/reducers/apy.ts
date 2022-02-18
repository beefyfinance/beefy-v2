import { createSlice } from '@reduxjs/toolkit';
import { fetchApyAction } from '../actions/apy';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { ApyData } from '../apis/beefy';
import { BoostEntity } from '../entities/boost';
import { isGovVault, VaultEntity } from '../entities/vault';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
} from '../selectors/boosts';
import { selectTokenPriceByTokenId } from '../selectors/tokens';
import { selectVaultById } from '../selectors/vaults';
import { BeefyState } from '../../../redux-types';
import {
  BoostContractData,
  FetchAllContractDataResult,
} from '../apis/contract-data/contract-data-types';
import { getBoostStatusFromPeriodFinish } from './boosts';
import { selectIsConfigAvailable } from '../selectors/data-loader';
import { reloadBalanceAndAllowanceAndGovRewards } from '../actions/tokens';

// boost is expressed as APR
interface AprData {
  apr: number;
}

// TODO: this should be reworked
export interface TotalApy {
  totalApy?: number;
  totalDaily?: number;
  vaultApr?: number;
  vaultDaily?: number;
  tradingApr?: number;
  tradingDaily?: number;
  boostApr?: number;
  boostDaily?: number;
  boostedTotalApy?: number;
  boostedTotalDaily?: number;
}

/**
 * State containing APY infos indexed by vault id
 */
export interface ApyState {
  rawApy: {
    byVaultId: {
      // we reuse the api types, not the best idea but works for now
      [vaultId: VaultEntity['id']]: ApyData;
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
    builder.addCase(fetchApyAction.fulfilled, (sliceState, action) => {
      for (const [vaultId, apy] of Object.entries(action.payload.data)) {
        sliceState.rawApy.byVaultId[vaultId] = apy;
      }

      // recompute total apy to have it ready to render vault list super fast
      const state = action.payload.state;
      const updatedState: BeefyState = { ...state, biz: { ...state.biz, apy: sliceState } };
      recomputeTotalApy(updatedState, sliceState);
    });

    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      addContractDataToState(state, sliceState, action.payload.data);
    });

    builder.addCase(reloadBalanceAndAllowanceAndGovRewards.fulfilled, (sliceState, action) => {
      const state = action.payload.state;
      addContractDataToState(state, sliceState, action.payload.contractData);
    });
  },
});

function addContractDataToState(
  state: BeefyState,
  sliceState: WritableDraft<ApyState>,
  contractData: FetchAllContractDataResult
) {
  const now = new Date();
  const activeBoostsByVaultIds: { [vaultId: VaultEntity['id']]: BoostContractData[] } = {};

  for (const boostContractData of contractData.boosts) {
    const boost = selectBoostById(state, boostContractData.id);
    const vault = selectVaultById(state, boost.vaultId);
    const boostStatus = getBoostStatusFromPeriodFinish(boostContractData.periodFinish, now);
    // boost is expired, don't count apy
    if (boostStatus === 'expired') {
      continue;
    }
    if (activeBoostsByVaultIds[vault.id] === undefined) {
      activeBoostsByVaultIds[vault.id] = [];
    }
    activeBoostsByVaultIds[vault.id].push(boostContractData);

    const tokenPrice = selectTokenPriceByTokenId(state, vault.oracleId);
    const earnedTokenPrice = selectTokenPriceByTokenId(state, boost.earnedTokenId);

    const totalStakedInUsd = boostContractData.totalSupply.times(tokenPrice);

    const yearlyRewardsInUsd = boostContractData.rewardRate
      .times(3600 * 24 * 365)
      .times(earnedTokenPrice);

    const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).toNumber();

    // add data to state
    sliceState.rawApy.byBoostId[boost.id] = { apr };
  }

  // recompute total apy to have it ready to render vault list super fast
  const updatedState: BeefyState = { ...state, biz: { ...state.biz, apy: sliceState } };
  recomputeTotalApy(updatedState, sliceState, activeBoostsByVaultIds);
}

function recomputeTotalApy(
  state: BeefyState,
  sliceState: WritableDraft<ApyState>,
  // we need up to date boost data to know if we need to include boost apy
  newActiveBoostsByVaultIds: { [vaultId: VaultEntity['id']]: BoostContractData[] } = {}
) {
  // no point in computing if all data is not loaded
  if (!selectIsConfigAvailable(state)) {
    return;
  }

  for (const [vaultId, apyData] of Object.entries(sliceState.rawApy.byVaultId)) {
    const values: TotalApy = {};

    // sometimes we get vault ids in the api that are not yet configure
    // locally, so we have to check that the vault exists first
    if (state.entities.vaults.byId[vaultId] === undefined) {
      continue;
    }

    const vault = selectVaultById(state, vaultId);
    const isBoosted =
      newActiveBoostsByVaultIds[vaultId] !== undefined || selectIsVaultBoosted(state, vaultId);

    let boostApr = 0;
    if (isBoosted) {
      // todo: not sure why but we only use the first
      const latestActiveBoostId =
        newActiveBoostsByVaultIds[vaultId] !== undefined
          ? newActiveBoostsByVaultIds[vaultId][0].id
          : selectActiveVaultBoostIds(state, vaultId)[0];
      boostApr = sliceState.rawApy.byBoostId[latestActiveBoostId]?.apr || 0;
    }
    const apy = apyData as any; /* Legacy code fix */

    values.totalApy = apy.totalApy;

    if (apy.vaultApr) {
      values.vaultApr = apy.vaultApr;
      values.vaultDaily = apy.vaultApr / 365;
    }

    if (apy.tradingApr) {
      values.tradingApr = apy.tradingApr;
      values.tradingDaily = apy.tradingApr / 365;
    }

    if (values.vaultDaily || values.tradingDaily) {
      values.totalDaily = (values.vaultDaily || 0) + (values.tradingDaily || 0);
    } else {
      values.totalDaily = yearlyToDaily(values.totalApy);
    }

    if (isGovVault(vault)) {
      values.totalApy = apy.vaultApr / 1;
      values.totalDaily = apy.vaultApr / 365;
    }

    if (isBoosted) {
      values.boostApr = boostApr;
      values.boostDaily = boostApr / 365;
      values.boostedTotalApy = values.boostApr ? values.totalApy + values.boostApr : 0;
      values.boostedTotalDaily = values.boostDaily ? values.totalDaily + values.boostDaily : 0;
    }

    sliceState.totalApy.byVaultId[vaultId] = values;
  }
}

const yearlyToDaily = (apy: number) => {
  const g = Math.pow(10, Math.log10(apy + 1) / 365) - 1;

  if (isNaN(g)) {
    return 0;
  }

  return g;
};
