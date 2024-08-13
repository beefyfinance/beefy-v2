import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import { isCowcentratedGovVault, isGovVault, type VaultEntity } from '../entities/vault';
import type { TotalApy } from '../reducers/apy';
import { selectAllVaultIdsIncludingHidden, selectVaultById } from '../selectors/vaults';
import { selectActiveVaultBoostIds } from '../selectors/boosts';
import { first } from 'lodash-es';
import { compoundInterest, yearlyToDaily } from '../../../helpers/number';
import { isDefined } from '../utils/array-utils';
import { getApiApyDataComponents } from '../../../helpers/apy';
import type { BeefyAPIApyBreakdownResponse } from '../apis/beefy/beefy-api-types';

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
  const vaultIds = selectAllVaultIdsIncludingHidden(state); // Hidden: OK
  const totals: Record<VaultEntity['id'], TotalApy> = {};
  const { allComponents, allDaily, compoundableDaily, nonCompoundableDaily } =
    getApiApyDataComponents();

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
      const aprKey = `${component}Apr` as const;
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

    // Presence of rewardPoolApr indicates new api calc that has correct totals
    // [Old gov pools had their apr in the vaultApr field]
    if (isGovVault(vault) && !('rewardPoolApr' in apy)) {
      if ('vaultApr' in apy) {
        total.rewardPoolApr = total.vaultApr;
        total.rewardPoolDaily = total.vaultDaily;
        delete total.vaultApr;
        delete total.vaultDaily;
      }
      total.totalApy = total.totalDaily * 365;
      total.totalMonthly = total.totalDaily * 30;
    }

    // Boosts
    const activeBoostId = first(selectActiveVaultBoostIds(state, vaultId));
    if (activeBoostId) {
      const boostApr = state.biz.apy.rawApy.byBoostId[activeBoostId]?.apr || 0;
      if (boostApr) {
        const boostDaily = boostApr / 365;
        total.boostApr = boostApr;
        total.boostDaily = boostDaily;
        total.boostedTotalApy = total.totalApy + total.boostApr;
        total.boostedTotalDaily = total.totalDaily + boostDaily;
      }
    }

    // Mark CLM Pools as boosted if they have extra pool rewards
    if (isCowcentratedGovVault(vault)) {
      // anything in 'rewardPoolApr' (i.e. not in 'rewardPoolTradingApr') is considered a soft-boost on the pool
      const additionalApr = total.rewardPoolApr || 0;
      if (additionalApr > 0) {
        total.boostedTotalApy = total.boostedTotalApy ?? total.totalApy;
        total.boostedTotalDaily = total.boostedTotalDaily ?? total.totalDaily;
        total.totalApy -= additionalApr;
        total.totalDaily -= additionalApr / 365;
      }
    }

    totals[vaultId] = total;
  }

  return { totals };
});
