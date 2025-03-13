import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import type { OptionalRecord } from '../../../../utils/types-utils.ts';
import { GyroPoolExitKind, GyroPoolJoinKind } from './types.ts';

export const poolJoinKindToGyroPoolJoinKind: OptionalRecord<PoolJoinKind, GyroPoolJoinKind> = {
  [PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT]: GyroPoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
};

export const poolExitKindToGyroPoolExitKind: OptionalRecord<PoolExitKind, GyroPoolExitKind> = {
  [PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT]: GyroPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT,
};
