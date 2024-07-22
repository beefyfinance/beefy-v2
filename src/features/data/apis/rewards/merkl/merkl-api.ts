import type { IMerklRewardsApi, MerklRewardsRequest, MerklRewardsResponse } from './merkl-types';
import { featureFlag_simulateMerklApiFailure } from '../../../utils/feature-flags';

export class MerklRewardsApi implements IMerklRewardsApi {
  async fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse> {
    const failureRate = featureFlag_simulateMerklApiFailure();
    if (failureRate !== false && Math.random() < failureRate) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error('Simulated Merkl API failure');
    }

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
