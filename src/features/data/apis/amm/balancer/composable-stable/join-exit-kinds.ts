import type { OptionalRecord } from '../../../../utils/types-utils.ts';
import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import { ComposableStablePoolExitKind, ComposableStablePoolJoinKind } from './types.ts';

export const poolJoinKindToComposableStablePoolJoinKind: OptionalRecord<
  PoolJoinKind,
  ComposableStablePoolJoinKind
> = {
  [PoolJoinKind.INIT]: ComposableStablePoolJoinKind.INIT,
  [PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT]:
    ComposableStablePoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
  [PoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT]:
    ComposableStablePoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT,
  [PoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT]:
    ComposableStablePoolJoinKind.ALL_TOKENS_IN_FOR_EXACT_BPT_OUT,
};

export const poolExitKindToComposableStablePoolExitKind: OptionalRecord<
  PoolExitKind,
  ComposableStablePoolExitKind
> = {
  [PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT]:
    ComposableStablePoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  [PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT]:
    ComposableStablePoolExitKind.EXACT_BPT_IN_FOR_ALL_TOKENS_OUT,
  [PoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT]:
    ComposableStablePoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT,
};
