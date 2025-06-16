import type {
  IMerklRewardsApi,
  MerklRewardsParams,
  MerklRewardsRequest,
  MerklRewardsResponse,
} from './merkl-types.ts';
import { featureFlag_simulateMerklApiFailure } from '../../../utils/feature-flags.ts';
import { makeRateLimitedHttpHelper } from '../../../../../helpers/http/http.ts';
import type { HttpHelper } from '../../../../../helpers/http/types.ts';

export class MerklRewardsApi implements IMerklRewardsApi {
  private http: HttpHelper;

  constructor() {
    this.http = makeRateLimitedHttpHelper('https://api.merkl.xyz', 1 / 30);
  }

  async fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse> {
    const failureRate = featureFlag_simulateMerklApiFailure();
    if (failureRate !== false && Math.random() < failureRate) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error('Simulated Merkl API failure');
    }

    const params: MerklRewardsParams = {
      chainId: request.chainId.join(','),
      test: request.test ? 'true' : 'false',
      claimableOnly: request.claimableOnly ? 'true' : 'false',
      breakdownPage: request.breakdownPage.toString(),
    };

    if (request.reloadChainId) {
      params.reloadChainId = request.reloadChainId.toString();
    }

    return await this.http.getJson<MerklRewardsResponse>(`/v4/users/${request.user}/rewards`, {
      params,
    });
  }
}
