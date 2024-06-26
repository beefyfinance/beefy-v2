import type { BeefyState } from '../../../redux-types';
import type { VaultEntity } from '../entities/vault';
import { createSelector } from '@reduxjs/toolkit';
import { getUnixTime } from 'date-fns';

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
