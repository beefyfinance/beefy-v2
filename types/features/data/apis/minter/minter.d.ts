import type { ChainEntity } from '../../entities/chain';
import type { FetchMinterReservesResult, IMinterApi } from './minter-types';
import type { MinterEntity } from '../../entities/minter';
export declare class MinterApi implements IMinterApi {
    protected chain: ChainEntity;
    constructor(chain: ChainEntity);
    fetchMinterReserves(minter: MinterEntity): Promise<FetchMinterReservesResult>;
}
