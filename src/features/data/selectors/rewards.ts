import { createSelector } from '@reduxjs/toolkit';
import { createBoundedSelector } from '../utils/selector-utils.ts';
import { createCachedSelector } from 're-reselect';
import { getUnixTime, isAfter } from 'date-fns';
import { uniqBy } from 'lodash-es';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { MerklRewardsCampaign, StellaSwapRewardsCampaign } from '../reducers/rewards-types.ts';
import type { BeefyState } from '../store/types.ts';
import { isNonEmptyArray } from '../utils/array-utils.ts';
import { selectVaultRawTvl } from './tvl.ts';

export type UnifiedRewardToken = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;

const byVaultId = {
  keySelector: (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  selectorCreator: createBoundedSelector,
};

export type MerklRewardsCampaignWithApr = MerklRewardsCampaign & {
  apr: number;
};

export type StellaSwapRewardsCampaignWithApr = StellaSwapRewardsCampaign & {
  apr: number;
};

export const selectVaultActiveMerklCampaigns = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.biz.rewards.offchain.byProviderId.merkl[vaultId],
  (state: BeefyState) => state.biz.rewards.offchain.byId,
  () => Math.trunc(Date.now() / 600000), // re-evaluate campaign windows on a 10-min bucket
  (vaultCampaigns, campaignById, _bucket): MerklRewardsCampaignWithApr[] | undefined => {
    if (!vaultCampaigns) {
      return undefined;
    }

    const now = getUnixTime(new Date());
    const activeCampaigns = vaultCampaigns
      .filter(v => v.apr > 0)
      .map(v => ({ ...(campaignById[v.id] as MerklRewardsCampaign), apr: v.apr }))
      .filter(c => c.startTimestamp <= now && c.endTimestamp >= now);

    return activeCampaigns.length ? activeCampaigns : undefined;
  }
)(byVaultId);

export function selectVaultHasActiveMerklCampaigns(state: BeefyState, vaultId: VaultEntity['id']) {
  const campaigns = selectVaultActiveMerklCampaigns(state, vaultId);
  return !!campaigns && campaigns.length > 0;
}

export function isMerklBoostCampaign(campaign: MerklRewardsCampaignWithApr): boolean {
  return (
    campaign.providerId === 'merkl' &&
    ((campaign.chainId === 'base' && campaign.type === 'zap-v3') ||
      (campaign.chainId === 'mode' && campaign.type === 'mode-grant'))
  );
}

export const selectVaultActiveStellaSwapCampaigns = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.biz.rewards.offchain.byProviderId.stellaswap[vaultId],
  (state: BeefyState) => state.biz.rewards.offchain.byId,
  () => Math.trunc(Date.now() / 600000), // re-evaluate campaign windows on a 10-min bucket
  (vaultCampaigns, campaignById, _bucket): StellaSwapRewardsCampaignWithApr[] | undefined => {
    if (!vaultCampaigns) {
      return undefined;
    }

    const now = getUnixTime(new Date());
    const activeCampaigns = vaultCampaigns
      .filter(v => v.apr > 0)
      .map(v => ({ ...(campaignById[v.id] as StellaSwapRewardsCampaign), apr: v.apr }))
      .filter(c => c.startTimestamp <= now && c.endTimestamp >= now);

    return activeCampaigns.length ? activeCampaigns : undefined;
  }
)(byVaultId);

export function selectVaultHasActiveStellaSwapCampaigns(
  state: BeefyState,
  vaultId: VaultEntity['id']
) {
  const campaigns = selectVaultActiveStellaSwapCampaigns(state, vaultId);
  return !!campaigns && campaigns.length > 0;
}

export const selectVaultHasActiveOffchainCampaigns = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.rewards.offchain.byVaultId[vaultId],
  (state: BeefyState) => state.biz.rewards.offchain.byId,
  () => Math.trunc(Date.now() / 600000), // re-evaluate campaign windows on a 10-min bucket
  (vaultCampaigns, campaignById, _bucket): boolean => {
    if (!vaultCampaigns || vaultCampaigns.length === 0) {
      return false;
    }

    const now = getUnixTime(new Date());
    return vaultCampaigns.some(vaultCampaign => {
      if (vaultCampaign.apr <= 0) {
        return false;
      }
      const campaign = campaignById[vaultCampaign.id];
      return !!campaign && campaign.startTimestamp <= now && campaign.endTimestamp >= now;
    });
  }
)(byVaultId);

export const selectVaultActiveGovRewards = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.rewards.gov.byVaultId[vaultId],
  selectVaultRawTvl,
  (state: BeefyState) => state.entities.tokens.prices.byOracleId,
  () => Math.trunc(Date.now() / 600000), // re-evaluate reward periods on a 10-min bucket
  (rewards, tvl, priceByOracleId, _bucket) => {
    if (!rewards || rewards.length === 0 || !tvl || tvl.isZero()) {
      return undefined;
    }

    const now = new Date();
    return rewards
      .filter(r => r.periodFinish && isAfter(r.periodFinish, now) && r.rewardRate.gt(BIG_ZERO))
      .map(r => {
        const price = priceByOracleId[r.token.oracleId] || BIG_ZERO;
        const yearlyUsd = price.times(r.rewardRate).times(365 * 24 * 60 * 60);

        return {
          index: r.index,
          token: r.token,
          price,
          apr: yearlyUsd.dividedBy(tvl).toNumber(),
        };
      })
      .filter(r => r.apr > 0);
  }
)(byVaultId);

export function selectVaultHasActiveGovRewards(state: BeefyState, vaultId: VaultEntity['id']) {
  const rewards = selectVaultActiveGovRewards(state, vaultId);
  return !!rewards && rewards.length > 0;
}

export const selectVaultActiveExtraRewardTokens = createSelector(
  selectVaultActiveMerklCampaigns,
  selectVaultActiveStellaSwapCampaigns,
  // TODO - add a selector for 'extra' gov rewards once we have the data
  (merklCampaigns, stellaSwapCampaigns): UnifiedRewardToken[] | undefined => {
    if (!isNonEmptyArray(merklCampaigns) && !isNonEmptyArray(stellaSwapCampaigns)) {
      return undefined;
    }

    const tokens: UnifiedRewardToken[] = [];

    for (const campaign of [...(merklCampaigns || []), ...(stellaSwapCampaigns || [])]) {
      tokens.push({
        address: campaign.rewardToken.address,
        symbol: campaign.rewardToken.symbol,
        decimals: campaign.rewardToken.decimals,
        chainId: campaign.rewardToken.chainId,
      });
    }

    return uniqBy(tokens, t => `${t.chainId}-${t.address}`);
  }
);
