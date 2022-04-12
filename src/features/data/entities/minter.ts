import { MinterConfig } from '../apis/config';
import { ChainEntity } from './chain';

export type MinterEntity = MinterConfig & { chainId: ChainEntity['id'] };
