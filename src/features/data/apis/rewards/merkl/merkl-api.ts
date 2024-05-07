import type {
  IMerklRewardsApi,
  MerklUserRewardsRequest,
  MerklUserRewardsResponse,
} from './merkl-types';

export class MerklRewardsApi implements IMerklRewardsApi {
  async fetchUserRewards(request: MerklUserRewardsRequest): Promise<MerklUserRewardsResponse> {
    const params = new URLSearchParams({
      user: request.user,
    });
    if (request.chainId) {
      params.append('chainId', request.chainId.toString());
    }
    if (request.proof) {
      params.append('proof', 'true');
    }
    const url = `https://api.merkl.xyz/v3/userRewards?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch user rewards: ${response.statusText}`);
    }
    return response.json();
  }
}
