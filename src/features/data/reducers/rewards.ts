import { createSlice } from '@reduxjs/toolkit';
import { fetchOffChainCampaignsAction } from '../actions/rewards';
import type {
  BeefyOffChainRewardsMerklCampaign,
  BeefyOffChainRewardsStellaSwapCampaign,
} from '../apis/beefy/beefy-api-types';
import type { VaultEntity } from '../entities/vault';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import type { GovVaultMultiContractData } from '../apis/contract-data/contract-data-types';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import type { Draft } from 'immer';
import { distributedOmit } from '../../../helpers/object';

type MerklRewardsCampaign = Omit<BeefyOffChainRewardsMerklCampaign, 'vaults'>;
type StellaSwapRewardsCampaign = Omit<BeefyOffChainRewardsStellaSwapCampaign, 'vaults'>;
type VaultRewardApr = { id: string; apr: number };

export type GovRewardsState = {
  byVaultId: Record<VaultEntity['id'], GovVaultMultiContractData['rewards']>;
};

export type RewardsState = {
  offchain: {
    byId: Record<string, MerklRewardsCampaign | StellaSwapRewardsCampaign>;
    byVaultId: Record<VaultEntity['id'], VaultRewardApr[]>;
    byProviderId: {
      merkl: Record<VaultEntity['id'], VaultRewardApr[]>;
      stellaswap: Record<VaultEntity['id'], VaultRewardApr[]>;
    };
  };
  gov: GovRewardsState;
};

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
        addGovVaultsMultiToState(sliceState, action.payload.data.govVaultsMulti);
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
