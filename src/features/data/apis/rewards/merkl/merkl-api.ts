import type { IMerklRewardsApi, MerklRewardsRequest, MerklRewardsResponse } from './merkl-types';
import { featureFlag_simulateMerklApiFailure } from '../../../utils/feature-flags';
import { getJson } from '../../../../../helpers/http';

export class MerklRewardsApi implements IMerklRewardsApi {
  async fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse> {
    const failureRate = featureFlag_simulateMerklApiFailure();
    if (failureRate !== false && Math.random() < failureRate) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error('Simulated Merkl API failure');
    }

    const url = `https://api.merkl.xyz/v3/rewards`;
    return await getJson({ url, params: { user: request.user } });
  }
}
