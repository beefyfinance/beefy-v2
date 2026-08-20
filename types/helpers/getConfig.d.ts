import type { MinterConfig } from '../features/data/apis/config-types';
import type { ChainEntity } from '../features/data/entities/chain';
export declare function getMinterConfig(chainId: ChainEntity['id']): Promise<MinterConfig[]>;
