import type { ChainEntity } from './chain.ts';
import type { MinterConfig } from '../apis/config-types.ts';

export type MinterEntity = MinterConfig & {
  chainId: ChainEntity['id'];
};
