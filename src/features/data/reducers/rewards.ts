import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { distributedOmit } from '../../../helpers/object.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { fetchOffChainCampaignsAction } from '../actions/rewards.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import type { GovVaultMultiContractData } from '../apis/contract-data/contract-data-types.ts';
import type { RewardsState } from './rewards-types.ts';

const initialState: RewardsState = {
  offchain: {
    byId: {},
    byVaultId: {},
    byProviderId: {
      merkl: {},
      stellaswap: {},
    },
  },
  gov: {
    byVaultId: {},
  },
};

export const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOffChainCampaignsAction.fulfilled, (sliceState, action) => {
        const byVaultId: RewardsState['offchain']['byVaultId'] = {};
        const byProviderId: RewardsState['offchain']['byProviderId'] = {
          merkl: {},
          stellaswap: {},
        };
        const seenIds = new Set<string>();

        for (const campaign of action.payload.campaigns) {
          seenIds.add(campaign.id);

          // map vaults to campaigns
          for (const vault of campaign.vaults) {
            byVaultId[vault.id] ??= [];
            byVaultId[vault.id].push({
              id: campaign.id,
              apr: vault.apr,
            });

            byProviderId[campaign.providerId][vault.id] ??= [];
            byProviderId[campaign.providerId][vault.id].push({
              id: campaign.id,
              apr: vault.apr,
            });
          }

          // add new campaigns
          seenIds.add(campaign.id);
          sliceState.offchain.byId[campaign.id] = distributedOmit(campaign, 'vaults');
        }

        // delete campaigns that are no longer present
        for (const campaignId in sliceState.offchain.byId) {
          if (!seenIds.has(campaignId)) {
            delete sliceState.offchain.byId[campaignId];
          }
        }

        sliceState.offchain.byVaultId = byVaultId;
        sliceState.offchain.byProviderId = byProviderId;
      })
      .addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
        addGovVaultsMultiToState(sliceState, action.payload.contractData.govVaultsMulti);
      })
      .addCase(
        reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
        (sliceState, action) => {
          addGovVaultsMultiToState(sliceState, action.payload.contractData.govVaultsMulti);
        }
      );
  },
});

function addGovVaultsMultiToState(
  sliceState: Draft<RewardsState>,
  govVaults: GovVaultMultiContractData[]
) {
  for (const govVault of govVaults) {
    if (govVault.rewards.length) {
      sliceState.gov.byVaultId[govVault.id] = govVault.rewards;
    }
  }
}

export const rewardsReducer = rewardsSlice.reducer;
