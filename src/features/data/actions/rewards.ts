import type { BeefyState } from '../../../redux-types';
import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBeefyApi } from '../apis/instances';

export type FetchOffChainRewardsActionParams = void;

export type FetchOffChainRewardsFulfilledPayload = {
  campaigns: BeefyOffChainRewardsCampaign[];
};

export const fetchOffChainCampaignsAction = createAsyncThunk<
  FetchOffChainRewardsFulfilledPayload,
  FetchOffChainRewardsActionParams,
  { state: BeefyState }
>('rewards/fetchOffChainCampaigns', async () => {
  const api = await getBeefyApi();
  const campaigns = await api.getOffChainRewardCampaigns();
  return { campaigns };
});
