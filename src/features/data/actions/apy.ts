import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ApyDataAprComponents, BeefyAPIApyBreakdownResponse } from '../apis/beefy/beefy-api';
import { getBeefyApi } from '../apis/instances';
import { isGovVault, type VaultEntity } from '../entities/vault';
import type { TotalApy } from '../reducers/apy';
import { selectAllVaultIds, selectVaultById } from '../selectors/vaults';
import { selectActiveVaultBoostIds } from '../selectors/boosts';
import { first } from 'lodash-es';
import { compoundInterest, yearlyToDaily } from '../../../helpers/number';
import { isDefined } from '../utils/array-utils';

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

function sumTotalApyComponents(total: TotalApy, fields: Array<keyof TotalApy>): number {
  return fields
    .map(key => total[key])
    .filter(isDefined)
    .reduce((acc: number, curr) => acc + curr, 0);
}

export const recalculateTotalApyAction = createAsyncThunk<
  RecalculateTotalApyPayload,
  void,
  { state: BeefyState }
>('apy/recalculateTotalApy', async (_, { getState }) => {
  const state = getState();
  const vaultIds = selectAllVaultIds(state);
  const totals: Record<VaultEntity['id'], TotalApy> = {};
  const compoundableComponents = ['vault', 'clm'] as const satisfies Array<ApyDataAprComponents>;
  const nonCompoundableComponents = [
    'trading',
    'liquidStaking',
    'composablePool',
    'merkl',
  ] as const satisfies Array<ApyDataAprComponents>;
  const allComponents = [...compoundableComponents, ...nonCompoundableComponents];
  const compoundableDaily = compoundableComponents.map(component => `${component}Daily` as const);
  const nonCompoundableDaily = nonCompoundableComponents.map(
    component => `${component}Daily` as const
  );
  const allDaily = allComponents.map(component => `${component}Daily` as const);

  for (const vaultId of vaultIds) {
    const apy = state.biz.apy.rawApy.byVaultId[vaultId];
    if (!apy) {
      continue;
    }

    const vault = selectVaultById(state, vaultId);
    const total: TotalApy = {
      totalApy: 'totalApy' in apy ? apy.totalApy : 0,
      totalMonthly: 0,
      totalDaily: 0,
    };

    // Extract all the components from the apy object to the total object as Apr and Daily
    for (const component of allComponents) {
      const aprKey = `${component}Apr`;
      const apr = apy[aprKey];
      if (apr) {
        total[aprKey] = apr;
        total[`${component}Daily`] = apr / 365;
      }
    }

    // Calculate the total monthly and daily apy from components
    if (allDaily.some(key => key in total)) {
      total.totalDaily = sumTotalApyComponents(total, allDaily);
      const totalCompoundable = sumTotalApyComponents(total, compoundableDaily);
      const totalNonCompoundable = sumTotalApyComponents(total, nonCompoundableDaily);
      total.totalMonthly =
        totalNonCompoundable * 30 + compoundInterest(totalCompoundable, 1, 1, 30);
    } else {
      // "uncompound" apy to get daily apr
      total.totalDaily = yearlyToDaily(total.totalApy);
      // we don't know what parts of the totalApy are compoundable, so simple * 30 for monthly
      total.totalMonthly = total.totalDaily * 30;
    }

    // Gov vaults don't auto-compound
    if (isGovVault(vault) && 'vaultApr' in apy) {
      total.totalApy = apy.vaultApr;
      total.totalDaily = apy.vaultApr / 365;
      total.totalMonthly = total.totalDaily * 30;
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
