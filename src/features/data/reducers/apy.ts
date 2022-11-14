import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { BeefyState } from '../../../redux-types';
import { fetchApyAction } from '../actions/apy';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import { ApyData } from '../apis/beefy';
import {
  BoostContractData,
  FetchAllContractDataResult,
} from '../apis/contract-data/contract-data-types';
import { BoostEntity } from '../entities/boost';
import { isGovVault, VaultEntity } from '../entities/vault';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsBoostActiveOrPreStake,
  selectIsVaultBoosted,
} from '../selectors/boosts';
import { selectIsConfigAvailable } from '../selectors/data-loader';
import { selectTokenByAddress, selectTokenPriceByAddress } from '../selectors/tokens';
import { selectVaultById, selectVaultPricePerFullShare } from '../selectors/vaults';
import { createIdMap } from '../utils/array-utils';
import { mooAmountToOracleAmount } from '../utils/ppfs';
import { BIG_ONE } from '../../../helpers/big-number';

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
  composablePoolApr?: number;
  composablePoolDaily?: number;
  liquidStakingApr?: number;
  liquidStakingDaily?: number;
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

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        const state = action.payload.state;
        addContractDataToState(state, sliceState, action.payload.contractData);
      }
    );
  },
});

function addContractDataToState(
  state: BeefyState,
  sliceState: WritableDraft<ApyState>,
  contractData: FetchAllContractDataResult
) {
  const activeBoostsByVaultIds: { [vaultId: VaultEntity['id']]: BoostContractData[] } = {};

  // create a quick access map
  const vaultDataByVaultId = createIdMap(contractData.standardVaults);

  for (const boostContractData of contractData.boosts) {
    const boost = selectBoostById(state, boostContractData.id);
    const vault = selectVaultById(state, boost.vaultId);
    const isBoostActiveOrPrestake = selectIsBoostActiveOrPreStake(state, boostContractData.id);
    // boost is expired, don't count apy
    if (!isBoostActiveOrPrestake) {
      continue;
    }
    if (activeBoostsByVaultIds[vault.id] === undefined) {
      activeBoostsByVaultIds[vault.id] = [];
    }
    activeBoostsByVaultIds[vault.id].push(boostContractData);

    /**
     * Some boosts can yield rewards in mooToken, be it from the same vault
     * or for another vault (like binSPIRIT) and some boost yield rewards as another
     * unrelated token (like PAE). When the boost is a mooToken, we don't have the
     * token price in the api so we need to compute it.
     **/
    let earnedPrice = null;
    const rewardTargetVaultId =
      state.entities.vaults.byChainId[boost.chainId]?.standardVault.byEarnedTokenAddress[
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

    if (apy.composablePoolApr) {
      values.composablePoolApr = apy.composablePoolApr;
      values.composablePoolDaily = apy.composablePoolApr / 365;
    }

    if (apy.liquidStakingApr) {
      values.liquidStakingApr = apy.liquidStakingApr;
      values.liquidStakingDaily = apy.liquidStakingApr / 365;
    }

    if (
      values.vaultDaily ||
      values.tradingDaily ||
      values.composablePoolDaily ||
      values.liquidStakingDaily
    ) {
      values.totalDaily =
        (values.vaultDaily || 0) +
        (values.tradingDaily || 0) +
        (values.composablePoolDaily || 0) +
        (values.liquidStakingDaily || 0);
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
