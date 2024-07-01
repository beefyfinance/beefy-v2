import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { createSelector } from '@reduxjs/toolkit';
import { getUnixTime, isAfter } from 'date-fns';
import { selectVaultTvl } from './tvl';
import { BIG_ZERO } from '../../../helpers/big-number';

export const selectVaultActiveMerklCampaigns = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.rewards.merkl.byVaultId[vaultId],
  (state: BeefyState) => state.biz.rewards.merkl.byId,
  (vaultCampaigns, campaignById) => {
    if (!vaultCampaigns) {
      return undefined;
    }

    const now = getUnixTime(new Date());
    return vaultCampaigns
      .filter(v => v.apr > 0)
      .map(v => ({ ...campaignById[v.campaignId], apr: v.apr }))
      .filter(c => c.startTimestamp <= now && c.endTimestamp >= now);
  }
);

export const selectVaultHasActiveMerklCampaigns = createSelector(
  selectVaultActiveMerklCampaigns,
  campaigns => !!campaigns && campaigns.length > 0
);

export const selectVaultActiveGovRewards = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.rewards.gov.byVaultId[vaultId],
  selectVaultTvl,
  (state: BeefyState) => state.entities.tokens.prices.byOracleId,
  (rewards, tvl, priceByOracleId) => {
    console.log(rewards, tvl);
    if (!rewards || rewards.length === 0 || !tvl || tvl.isZero()) {
      return undefined;
    }

    const now = new Date();
    return rewards
      .filter(r => isAfter(r.periodFinish, now) && r.rewardRate.gt(BIG_ZERO))
      .map(r => {
        const price = priceByOracleId[r.token.oracleId] || BIG_ZERO;
        const yearlyUsd = price.times(r.rewardRate).times(365 * 24 * 60 * 60);

        return {
          token: r.token,
          price,
          apr: yearlyUsd.dividedBy(tvl).toNumber(),
        };
      })
      .filter(r => r.apr > 0);
  }
);

export const selectVaultHasActiveGovRewards = createSelector(
  selectVaultActiveGovRewards,
  rewards => !!rewards && rewards.length > 0
);
