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
import { selectVaultActiveGovRewards } from '../selectors/rewards';
import { selectDepositTokenByVaultId } from '../selectors/tokens';
import type { ChainId } from '../entities/chain';

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
      // TODO find a better place for these
      const baseRewardTokensByChainProvider: Partial<Record<ChainId, Record<string, string[]>>> = {
        arbitrum: {
          ramses: [
            // RAM
            '0xAAA6C1E32C55A7Bfa8066A6FAE9b42650F262418',
            // ARB
            '0x912CE59144191C1204E64559FE8253a0e49E6548',
          ],
        },
        optimism: {
          velodrome: [
            // VELOv2
            '0x9560e827aF36c94D2Ac33a39bCE1Fe78631088Db',
          ],
        },
        base: {
          aerodrome: [
            // AERO
            '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
          ],
        },
      };
      const depositToken = selectDepositTokenByVaultId(state, vaultId);
      const baseRewardTokens = depositToken.providerId
        ? baseRewardTokensByChainProvider[vault.chainId]?.[depositToken.providerId]
        : undefined;
      // for 'pool' type (e.g. velodrome) we need to separate that part from fees vs additional rewards
      if (baseRewardTokens?.length) {
        const poolRewards = selectVaultActiveGovRewards(state, vaultId);
        if (poolRewards && poolRewards.length > 0) {
          const { rewardPoolApr, rewardPoolTradingApr } = poolRewards.reduce(
            (acc, r) => {
              // if reward is a base reward token, it's pool trading apr
              if (
                baseRewardTokens.some(
                  address => r.token.address.toLowerCase() === address.toLowerCase()
                )
              ) {
                acc.rewardPoolTradingApr += r.apr;
              } else {
                acc.rewardPoolApr += r.apr;
              }
              return acc;
            },
            { rewardPoolApr: 0, rewardPoolTradingApr: 0 }
          );

          const existingRewardPoolApr = total.rewardPoolApr || 0;
          const existingRewardPoolDaily = total.rewardPoolDaily || 0;
          const rewardPoolDaily = rewardPoolApr / 365;
          const rewardPoolTradingDaily = rewardPoolTradingApr / 365;

          if (rewardPoolApr > 0) {
            total.rewardPoolApr = rewardPoolApr;
            total.rewardPoolDaily = rewardPoolDaily;
          } else {
            delete total.rewardPoolApr;
            delete total.rewardPoolDaily;
          }
          total.rewardPoolTradingApr = rewardPoolTradingApr;
          total.rewardPoolTradingDaily = rewardPoolTradingDaily;
          total.totalApy =
            total.totalApy - existingRewardPoolApr + rewardPoolApr + rewardPoolTradingApr;
          total.totalDaily =
            total.totalDaily - existingRewardPoolDaily + rewardPoolDaily + rewardPoolTradingDaily;
          if (total.boostedTotalApy !== undefined) {
            total.boostedTotalApy =
              total.boostedTotalApy - existingRewardPoolApr + rewardPoolApr + rewardPoolTradingApr;
          }
          if (total.boostedTotalDaily !== undefined) {
            total.boostedTotalDaily =
              total.boostedTotalDaily -
              existingRewardPoolDaily +
              rewardPoolDaily +
              rewardPoolTradingDaily;
          }
        }
      }

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
