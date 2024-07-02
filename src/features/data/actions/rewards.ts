import type { BeefyState } from '../../../redux-types';
import type { BeefyApiMerklCampaign } from '../apis/beefy/beefy-api-types';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getBeefyApi } from '../apis/instances';

export type FetchMerklRewardsActionParams = void;

export type FetchMerklRewardsFulfilledPayload = {
  campaigns: BeefyApiMerklCampaign[];
};

export const fetchMerklCampaignsAction = createAsyncThunk<
  FetchMerklRewardsFulfilledPayload,
  FetchMerklRewardsActionParams,
  { state: BeefyState }
>('rewards/fetchMerklCampaigns', async () => {
  const api = await getBeefyApi();
  const campaigns = await api.getCowcentratedMerklCampaigns();
  return { campaigns };
});
