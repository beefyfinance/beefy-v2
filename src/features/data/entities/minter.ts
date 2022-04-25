import { ChainEntity } from './chain';
import { MinterConfig } from '../apis/config-types';

export type MinterEntity = MinterConfig & { chainId: ChainEntity['id'] };
