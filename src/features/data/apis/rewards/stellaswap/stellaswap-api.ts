import type {
  IStellaSwapRewardsApi,
  StellaSwapRewardsRequest,
  StellaSwapRewardsResponse,
} from './stellaswap-types';

export class StellaSwapRewardsApi implements IStellaSwapRewardsApi {
  async fetchRewards(request: StellaSwapRewardsRequest): Promise<StellaSwapRewardsResponse> {
    const url = `https://offchain-api.stellaswap.com/offchain/reward/beefy/${request.pool}/${request.user}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch StellaSwap rewards: ${response.status} ${response.statusText}`
      );
    }
    return response.json();
  }
}
