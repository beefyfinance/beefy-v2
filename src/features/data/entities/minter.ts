import type { ChainEntity } from './chain';
import type { MinterConfig } from '../apis/config-types';

export type MinterEntity = MinterConfig & { chainId: ChainEntity['id'] };
