import type { IMerklRewardsApi, MerklRewardsRequest, MerklRewardsResponse } from './merkl-types';

export class MerklRewardsApi implements IMerklRewardsApi {
  async fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse> {
    const params = new URLSearchParams({
      user: request.user,
    });
    const url = `https://api.merkl.xyz/v3/rewards?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch merkl rewards: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}
