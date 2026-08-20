import type { IMerklRewardsApi, MerklRewardsRequest, MerklRewardsResponse } from './merkl-types';
export declare class MerklRewardsApi implements IMerklRewardsApi {
    private http;
    constructor();
    fetchRewards(request: MerklRewardsRequest): Promise<MerklRewardsResponse>;
}
