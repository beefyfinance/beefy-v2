import type {
  IMerklRewardsApi,
  MerklRewardsParams,
  MerklRewardsRequest,
  MerklRewardsResponse,
} from './merkl-types.ts';
import { featureFlag_simulateMerklApiFailure } from '../../../utils/feature-flags.ts';
import { makeRateLimitedHttpHelper } from '../../../../../helpers/http/http.ts';
import type { HttpHelper } from '../../../../../helpers/http/types.ts';

const MERKL_API_URL = import.meta.env.VITE_MERKL_API_URL || 'https://merkl-api.beefy.finance';

export class MerklRewardsApi implements IMerklRewardsApi {
  private http: HttpHelper;

  constructor() {
    this.http = makeRateLimitedHttpHelper(MERKL_API_URL, 5 / 60);
  }

  async fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse> {
    const failureRate = featureFlag_simulateMerklApiFailure();
    if (failureRate !== false && Math.random() < failureRate) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      throw new Error('Simulated Merkl API failure');
    }

    const params: MerklRewardsParams = {
      chains: request.chainId.join(','),
    };

    if (request.reloadChainId) {
      params.reloadChainId = request.reloadChainId.toString();
    }

    return await this.http.getJson<MerklRewardsResponse>(`/v1/rewards/${request.user}`, {
      params,
    });
  }
}
