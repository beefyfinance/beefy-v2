import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import type { OptionalRecord } from '../../../../utils/types-utils.ts';
import { WeightedPoolExitKind, WeightedPoolJoinKind } from './types.ts';

export const poolJoinKindToWeightedPoolJoinKind: OptionalRecord<
  PoolJoinKind,
  WeightedPoolJoinKind
> = {
  [PoolJoinKind.INIT]: WeightedPoolJoinKind.INIT,
  [PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT]: WeightedPoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
  [PoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT]: WeightedPoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT,
  [PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT]:
    WeightedPoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
};

export const poolExitKindToWeightedPoolExitKind: OptionalRecord<
  PoolExitKind,
  WeightedPoolExitKind
> = {
  [PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT]:
    WeightedPoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  [PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT]: WeightedPoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT,
  [PoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT]: WeightedPoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT,
};
