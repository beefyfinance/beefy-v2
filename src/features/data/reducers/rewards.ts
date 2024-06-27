import { createSlice } from '@reduxjs/toolkit';
import { fetchMerklCampaignsAction } from '../actions/rewards';
import type { BeefyApiMerklCampaign } from '../apis/beefy/beefy-api-types';
import { omit } from 'lodash-es';
import type { VaultEntity } from '../entities/vault';

type MerklRewardsCampaign = Omit<BeefyApiMerklCampaign, 'vaults'>;
type MerklRewardsVault = { campaignId: string; apr: number };

export type MerklRewardsState = {
  byId: Record<string, MerklRewardsCampaign>;
  byVaultId: Record<VaultEntity['id'], MerklRewardsVault[]>;
};

export type RewardsState = {
  merkl: MerklRewardsState;
};

const initialState: RewardsState = {
  merkl: {
    byId: {},
    byVaultId: {},
  },
};

export const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchMerklCampaignsAction.fulfilled, (sliceState, action) => {
      const byVaultId: MerklRewardsState['byVaultId'] = {};
      const seenIds = new Set<string>();

      for (const campaign of action.payload.campaigns) {
        seenIds.add(campaign.campaignId);
        // add new campaigns
        if (!sliceState.merkl.byId[campaign.campaignId]) {
          sliceState.merkl.byId[campaign.campaignId] = omit(campaign, 'vaults');
        }

        // map vaults to campaigns
        for (const vault of campaign.vaults) {
          if (!byVaultId[vault.id]) {
            byVaultId[vault.id] = [];
          }
          byVaultId[vault.id].push({
            campaignId: campaign.campaignId,
            apr: vault.apr,
          });
        }
      }

      // delete campaigns that are no longer present
      for (const campaignId in sliceState.merkl.byId) {
        if (!seenIds.has(campaignId)) {
          delete sliceState.merkl.byId[campaignId];
        }
      }

      sliceState.merkl.byVaultId = byVaultId;
    });
  },
});

export const rewardsReducer = rewardsSlice.reducer;
