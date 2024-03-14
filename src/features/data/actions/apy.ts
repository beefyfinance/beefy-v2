import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { BeefyAPIApyBreakdownResponse } from '../apis/beefy/beefy-api';
import { getBeefyApi } from '../apis/instances';
import { isGovVault, type VaultEntity } from '../entities/vault';
import type { TotalApy } from '../reducers/apy';
import { selectAllVaultIds, selectVaultById } from '../selectors/vaults';
import { selectActiveVaultBoostIds } from '../selectors/boosts';
import { first } from 'lodash-es';
import { yearlyToDaily } from '../../../helpers/number';

export interface FetchAllApyFulfilledPayload {
  data: BeefyAPIApyBreakdownResponse;
  // reducers need the state (balance)
  state: BeefyState;
}

export const fetchApyAction = createAsyncThunk<
  FetchAllApyFulfilledPayload,
  void,
  { state: BeefyState }
>('apy/fetchApy', async (_, { getState }) => {
  const api = await getBeefyApi();
  const prices = await api.getApyBreakdown();
  return { data: prices, state: getState() };
});

export type RecalculateTotalApyPayload = {
  totals: Record<VaultEntity['id'], TotalApy>;
};

export const recalculateTotalApyAction = createAsyncThunk<
  RecalculateTotalApyPayload,
  void,
  { state: BeefyState }
>('apy/recalculateTotalApy', async (_, { getState }) => {
  const state = getState();
  const vaultIds = selectAllVaultIds(state);
  const totals: Record<VaultEntity['id'], TotalApy> = {};

  for (const vaultId of vaultIds) {
    const apy = state.biz.apy.rawApy.byVaultId[vaultId];
    if (!apy) {
      continue;
    }

    const vault = selectVaultById(state, vaultId);
    const total: TotalApy = {
      totalApy: 0,
      totalDaily: 0,
    };

    total.totalApy = 'totalApy' in apy ? apy.totalApy : 0;

    if ('vaultApr' in apy && apy.vaultApr) {
      total.vaultApr = apy.vaultApr;
      total.vaultDaily = apy.vaultApr / 365;
    }

    if ('tradingApr' in apy && apy.tradingApr) {
      total.tradingApr = apy.tradingApr;
      total.tradingDaily = apy.tradingApr / 365;
    }

    if ('composablePoolApr' in apy && apy.composablePoolApr) {
      total.composablePoolApr = apy.composablePoolApr;
      total.composablePoolDaily = apy.composablePoolApr / 365;
    }

    if ('liquidStakingApr' in apy && apy.liquidStakingApr) {
      total.liquidStakingApr = apy.liquidStakingApr;
      total.liquidStakingDaily = apy.liquidStakingApr / 365;
    }

    if (
      total.vaultDaily ||
      total.tradingDaily ||
      total.composablePoolDaily ||
      total.liquidStakingDaily
    ) {
      total.totalDaily =
        (total.vaultDaily || 0) +
        (total.tradingDaily || 0) +
        (total.composablePoolDaily || 0) +
        (total.liquidStakingDaily || 0);
    } else {
      total.totalDaily = yearlyToDaily(total.totalApy);
    }

    if (isGovVault(vault) && 'vaultApr' in apy) {
      total.totalApy = apy.vaultApr;
      total.totalDaily = apy.vaultApr / 365;
    }

    const activeBoostId = first(selectActiveVaultBoostIds(state, vaultId));
    if (activeBoostId) {
      const boostApr = state.biz.apy.rawApy.byBoostId[activeBoostId]?.apr || 0;
      if (boostApr) {
        total.boostApr = boostApr;
        total.boostDaily = boostApr / 365;
        total.boostedTotalApy = total.boostApr ? total.totalApy + total.boostApr : 0;
        total.boostedTotalDaily = total.boostDaily ? total.totalDaily + total.boostDaily : 0;
      }
    }

    totals[vaultId] = total;
  }

  return { totals };
});
