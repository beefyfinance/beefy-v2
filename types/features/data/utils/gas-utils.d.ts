import type { ChainEntity } from '../entities/chain';
export declare function getGasPriceOptions(chain: ChainEntity): Promise<import("../apis/gas-prices/gas-prices").GasPricing>;
