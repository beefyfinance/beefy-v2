import type { IStellaSwapRewardsApi, StellaSwapPoolRewardsRequest, StellaSwapPoolRewardsResponse, StellaSwapRewardsRequest, StellaSwapRewardsResponse } from './stellaswap-types';
export declare class StellaSwapRewardsApi implements IStellaSwapRewardsApi {
    private http;
    constructor();
    fetchRewards(request: StellaSwapRewardsRequest): Promise<StellaSwapRewardsResponse>;
    fetchRewardForPool(request: StellaSwapPoolRewardsRequest): Promise<StellaSwapPoolRewardsResponse>;
}
