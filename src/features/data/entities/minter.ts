import type { MinterConfig } from '../apis/config-types.ts';
import type { ChainEntity } from '../apis/chains/entity-types.ts';

export type MinterEntity = MinterConfig & {
  chainId: ChainEntity['id'];
};
