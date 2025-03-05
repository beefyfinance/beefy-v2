import type { BeefyState } from '../../../redux-types.ts';
import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types.ts';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBeefyApi } from '../apis/instances.ts';

export type FetchOffChainRewardsActionParams = void;

export type FetchOffChainRewardsFulfilledPayload = {
  campaigns: BeefyOffChainRewardsCampaign[];
};

export const fetchOffChainCampaignsAction = createAsyncThunk<
  FetchOffChainRewardsFulfilledPayload,
  FetchOffChainRewardsActionParams,
  {
    state: BeefyState;
  }
>('rewards/fetchOffChainCampaigns', async () => {
  const api = await getBeefyApi();
  const campaigns = await api.getOffChainRewardCampaigns();
  return { campaigns };
});
