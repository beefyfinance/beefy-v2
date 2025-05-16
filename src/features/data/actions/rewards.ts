import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

export type FetchOffChainRewardsActionParams = void;

export type FetchOffChainRewardsFulfilledPayload = {
  campaigns: BeefyOffChainRewardsCampaign[];
};

export const fetchOffChainCampaignsAction = createAppAsyncThunk<
  FetchOffChainRewardsFulfilledPayload,
  FetchOffChainRewardsActionParams
>('rewards/fetchOffChainCampaigns', async () => {
  const api = await getBeefyApi();
  const campaigns = await api.getOffChainRewardCampaigns();
  return { campaigns };
});
