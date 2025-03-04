import type {
  IStellaSwapRewardsApi,
  StellaSwapPoolRewardsRequest,
  StellaSwapPoolRewardsResponse,
  StellaSwapRewardsRequest,
  StellaSwapRewardsResponse,
} from './stellaswap-types.ts';
import type { HttpHelper } from '../../../../../helpers/http/types.ts';
import { makeRateLimitedHttpHelper } from '../../../../../helpers/http/http.ts';

export class StellaSwapRewardsApi implements IStellaSwapRewardsApi {
  private http: HttpHelper;

  constructor() {
    this.http = makeRateLimitedHttpHelper('https://offchain-api.stellaswap.com', 1);
  }

  async fetchRewards(request: StellaSwapRewardsRequest): Promise<StellaSwapRewardsResponse> {
    return await this.http.getJson(`/offchain/reward/beefy/${request.user.toLowerCase()}`);
  }

  async fetchRewardForPool(
    request: StellaSwapPoolRewardsRequest
  ): Promise<StellaSwapPoolRewardsResponse> {
    return await this.http.getJson(
      `/offchain/reward/beefy/${request.pool.toLowerCase()}/${request.user.toLowerCase()}`
    );
  }
}
