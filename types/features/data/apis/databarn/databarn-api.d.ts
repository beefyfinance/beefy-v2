import type { DatabarnPricesResponse, DatabarnPriceType, DatabarnTimeBucket, DatabarnTimelineEntry, IDatabarnApi } from './databarn-types';
import type { VaultEntity } from '../../entities/vault';
import type { ChainEntity } from '../../entities/chain';
export declare class DatabarnApi implements IDatabarnApi {
    private readonly databarnBase;
    constructor();
    getInvestorTimeline(address: string): Promise<Array<DatabarnTimelineEntry>>;
    getVaultPrices(productType: 'vault' | 'boost', priceType: DatabarnPriceType, timeBucket: DatabarnTimeBucket, address: VaultEntity['contractAddress'], chain: ChainEntity['id']): Promise<DatabarnPricesResponse>;
}
