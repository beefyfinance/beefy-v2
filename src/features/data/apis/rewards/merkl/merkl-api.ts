import type { IMerklRewardsApi, MerklRewardsRequest, MerklRewardsResponse } from './merkl-types';
import { featureFlag_simulateMerklApiFailure } from '../../../utils/feature-flags';
import { handleFetchParams } from '../../transact/helpers/fetch';

export class MerklRewardsApi implements IMerklRewardsApi {
  async fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse> {
    const failureRate = featureFlag_simulateMerklApiFailure();
    if (failureRate !== false && Math.random() < failureRate) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error('Simulated Merkl API failure');
    }

    const url = `https://api.merkl.xyz/v3/rewards?${handleFetchParams({
      user: request.user,
    })}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch merkl rewards: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}
