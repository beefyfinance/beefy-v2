import { first, keyBy, mapValues, partition } from 'lodash-es';
import { AVG_APY_PERIODS, EMPTY_AVG_APY, getApiApyDataComponents } from '../../../helpers/apy.ts';
import { getUnixNow } from '../../../helpers/date.ts';
import { compoundInterest, yearlyToDaily } from '../../../helpers/number.ts';
import type { BeefyAPIApyBreakdownResponse } from '../apis/beefy/beefy-api-types.ts';
import type { ApiAvgApy } from '../apis/beefy/beefy-data-api-types.ts';
import { getBeefyApi, getBeefyDataApi } from '../apis/instances.ts';
import {
  isCowcentratedGovVault,
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { AvgApy, AvgApyPeriod, RawAvgApy, TotalApy } from '../reducers/apy-types.ts';
import { selectVaultTotalApy } from '../selectors/apy.ts';
import { selectActiveVaultBoostIds } from '../selectors/boosts.ts';
import {
  isMerklBoostCampaign,
  type MerklRewardsCampaignWithApr,
  selectVaultActiveMerklCampaigns,
} from '../selectors/rewards.ts';
import {
  selectAllVaultIdsIncludingHidden,
  selectAllVisibleVaultIds,
  selectVaultById,
} from '../selectors/vaults.ts';
import { isDefined } from '../utils/array-utils.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export interface FetchAllApyFulfilledPayload {
  data: BeefyAPIApyBreakdownResponse;
}

export const fetchApyAction = createAppAsyncThunk<FetchAllApyFulfilledPayload, void>(
  'apy/fetchApy',
  async (_, { getState }) => {
    const api = await getBeefyApi();
    const prices = await api.getApyBreakdown();
    return { data: prices, state: getState() };
  }
);

export interface FetchAvgApysFulfilledPayload {
  data: Record<string, RawAvgApy>;
}

export const fetchAvgApyAction = createAppAsyncThunk<FetchAvgApysFulfilledPayload, void>(
  'apy/fetchAvgApy',
  async () => {
    const api = await getBeefyDataApi();
    const avgApys = await api.getAvgApys();

    const data = avgApys.map((apy: ApiAvgApy) => [
      apy.vault_id,
      {
        periods: [
          { days: 7, apy: apy.avg_7d },
          { days: 30, apy: apy.avg_30d },
          { days: 90, apy: apy.avg_90d },
        ].filter(period => (AVG_APY_PERIODS as number[]).includes(period.days)),
      },
    ]);

    return { data: Object.fromEntries(data) };
  }
);

export type FetchAvgApyFulfilledPayload = {
  data: Record<string, AvgApy>;
};

export const recalculateAvgApyAction = createAppAsyncThunk<FetchAvgApyFulfilledPayload, void>(
  'apy/recalculateAvgApy',
  async (_, { getState }) => {
    const state = getState();
    const rawAverages = state.biz.apy.rawAvgApy.byVaultId;
    const unprocessedVaultIds = new Set(selectAllVisibleVaultIds(state));

    const data = mapValues(rawAverages, (rawAverage, vaultId) => {
      // don't try to process apy for vaults no longer in app
      if (!unprocessedVaultIds.has(vaultId)) {
        return EMPTY_AVG_APY;
      }
      unprocessedVaultIds.delete(vaultId);

      const vault = selectVaultById(state, vaultId);
      const vaultAge = (getUnixNow() - vault.createdAt) / 86400;

      let previousFull = 0;
      const periods = rawAverage.periods.map(period => {
        const dataDays = Math.ceil(Math.min(vaultAge, period.days));
        const full = dataDays >= period.days;
        const partial = full || dataDays > previousFull;
        previousFull = dataDays;
        return {
          days: period.days,
          dataDays,
          value: period.apy,
          partial,
          full,
        } satisfies AvgApyPeriod;
      });

      return {
        periods: keyBy(periods, 'days'),
        partial: periods.filter(p => p.partial).map(p => p.days),
        full: periods.filter(p => p.full).map(p => p.days),
      };
    });

    // add current apy for vaults that are not in the api response to make sorting straightforward
    for (const vaultId of unprocessedVaultIds) {
      const apy = selectVaultTotalApy(state, vaultId);
      const periods = AVG_APY_PERIODS.map(
        days =>
          ({
            days,
            dataDays: 0,
            value: apy.boostedTotalApy || apy.totalApy,
            partial: false,
            full: false,
          }) satisfies AvgApyPeriod
      );
      data[vaultId] = {
        periods: keyBy(periods, 'days'),
        partial: [],
        full: [],
      };
    }

    return { data };
  }
);

export type RecalculateTotalApyPayload = {
  totals: Record<VaultEntity['id'], TotalApy>;
};

function sumTotalApyComponents(
  total: TotalApy,
  fields: Array<Exclude<keyof TotalApy, 'totalApy' | 'totalMonthly' | 'totalDaily' | 'totalType'>>
): number {
  return fields
    .map(key => total[key])
    .filter(isDefined)
    .reduce((acc: number, curr) => acc + curr, 0);
}

export const recalculateTotalApyAction = createAppAsyncThunk<RecalculateTotalApyPayload, void>(
  'apy/recalculateTotalApy',
  async (_, { getState }) => {
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
        totalType: isStandardVault(vault) ? 'apy' : 'apr',
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

      // Mark as compounding if base CLM compounds
      if (isCowcentratedGovVault(vault) || isCowcentratedVault(vault)) {
        const hasCompounding = compoundableDaily.some(key => key in total && total[key]);
        if (hasCompounding) {
          total.totalType = 'apy';
        }
      }

      // Mark CLM Pools as boosted if they have specific active merkl campaigns
      const merklCampaigns = selectVaultActiveMerklCampaigns(state, vaultId);
      if (merklCampaigns && merklCampaigns.length > 0) {
        const [boostCampaigns, restCampaigns] = partition(merklCampaigns, isMerklBoostCampaign);
        if (boostCampaigns.length > 0) {
          modifyApyMerklBoostCampaigns(total, boostCampaigns, restCampaigns);
        }
      }

      totals[vaultId] = total;
    }

    return { totals };
  }
);

/** mutates the total object */
function modifyApyMerklBoostCampaigns(
  total: TotalApy,
  boostCampaigns: MerklRewardsCampaignWithApr[],
  restCampaigns: MerklRewardsCampaignWithApr[]
) {
  const newMerklApr = restCampaigns.reduce((acc, c) => acc + c.apr, 0);
  const newMerklDaily = newMerklApr / 365;

  const merklBoostApr = boostCampaigns.reduce((acc, c) => acc + c.apr, 0);
  const merklBoostDaily = merklBoostApr / 365;

  const originalMerklApr = total.merklApr || 0;
  const originalMerklDaily = total.merklDaily || 0;

  delete total.merklApr;
  delete total.merklDaily;

  total.totalApy = total.totalApy - originalMerklApr + newMerklApr;
  total.totalDaily = total.totalDaily - originalMerklDaily + newMerklDaily;

  if (newMerklApr > 0) {
    total.merklApr = newMerklApr;
    total.merklDaily = newMerklDaily;
  }

  if (merklBoostApr > 0) {
    total.merklBoostApr = merklBoostApr;
    total.merklBoostDaily = merklBoostDaily;
  }

  if (total.boostApr || total.merklBoostApr) {
    total.boostedTotalApy = total.totalApy + (total.boostApr || 0) + (total.merklBoostApr || 0);
    total.boostedTotalDaily =
      total.totalDaily + (total.boostDaily || 0) + (total.merklBoostDaily || 0);
  }
}
