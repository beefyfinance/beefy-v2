import { createSelector } from '@reduxjs/toolkit';
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

export type MerklRewardsCampaignWithApr = MerklRewardsCampaign & {
  apr: number;
};

export type StellaSwapRewardsCampaignWithApr = StellaSwapRewardsCampaign & {
  apr: number;
};

export const selectVaultActiveMerklCampaigns = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.biz.rewards.offchain.byProviderId.merkl[vaultId],
  (state: BeefyState) => state.biz.rewards.offchain.byId,
  (vaultCampaigns, campaignById): MerklRewardsCampaignWithApr[] | undefined => {
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
);

export const selectVaultHasActiveMerklCampaigns = createSelector(
  selectVaultActiveMerklCampaigns,
  campaigns => !!campaigns && campaigns.length > 0
);

export function isMerklBoostCampaign(campaign: MerklRewardsCampaignWithApr): boolean {
  return (
    campaign.providerId === 'merkl' &&
    ((campaign.chainId === 'base' && campaign.type === 'zap-v3') ||
      (campaign.chainId === 'mode' && campaign.type === 'mode-grant'))
  );
}

export const selectVaultActiveMerklBoostCampaigns = createSelector(
  selectVaultActiveMerklCampaigns,
  campaigns => {
    if (!campaigns) {
      return undefined;
    }

    const filtered = campaigns.filter(isMerklBoostCampaign);
    return filtered.length ? filtered : undefined;
  }
);

export const selectVaultHasActiveMerklBoostCampaigns = createSelector(
  selectVaultActiveMerklBoostCampaigns,
  campaigns => !!campaigns && campaigns.length > 0
);

export const selectVaultActiveStellaSwapCampaigns = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.biz.rewards.offchain.byProviderId.stellaswap[vaultId],
  (state: BeefyState) => state.biz.rewards.offchain.byId,
  (vaultCampaigns, campaignById): StellaSwapRewardsCampaignWithApr[] | undefined => {
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
);

export const selectVaultHasActiveStellaSwapCampaigns = createSelector(
  selectVaultActiveStellaSwapCampaigns,
  campaigns => !!campaigns && campaigns.length > 0
);

export const selectVaultHasActiveOffchainCampaigns = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.rewards.offchain.byVaultId[vaultId],
  campaigns => !!campaigns && campaigns.length > 0 && campaigns.some(c => c.apr > 0)
);

export const selectVaultActiveGovRewards = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.biz.rewards.gov.byVaultId[vaultId],
  selectVaultRawTvl,
  (state: BeefyState) => state.entities.tokens.prices.byOracleId,
  (rewards, tvl, priceByOracleId) => {
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
);

export const selectVaultHasActiveGovRewards = createSelector(
  selectVaultActiveGovRewards,
  rewards => !!rewards && rewards.length > 0
);

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
