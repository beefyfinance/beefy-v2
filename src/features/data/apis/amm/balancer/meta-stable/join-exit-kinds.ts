import { PoolExitKind, PoolJoinKind } from '../common/types.ts';
import type { OptionalRecord } from '../../../../utils/types-utils.ts';
import { MetaStablePoolExitKind, MetaStablePoolJoinKind } from './types.ts';

export const poolJoinKindToMetaStablePoolJoinKind: OptionalRecord<
  PoolJoinKind,
  MetaStablePoolJoinKind
> = {
  [PoolJoinKind.INIT]: MetaStablePoolJoinKind.INIT,
  [PoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT]: MetaStablePoolJoinKind.EXACT_TOKENS_IN_FOR_BPT_OUT,
  [PoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT]: MetaStablePoolJoinKind.TOKEN_IN_FOR_EXACT_BPT_OUT,
};

export const poolExitKindToMetaStablePoolExitKind: OptionalRecord<
  PoolExitKind,
  MetaStablePoolExitKind
> = {
  [PoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT]:
    MetaStablePoolExitKind.EXACT_BPT_IN_FOR_ONE_TOKEN_OUT,
  [PoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT]: MetaStablePoolExitKind.EXACT_BPT_IN_FOR_TOKENS_OUT,
  [PoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT]: MetaStablePoolExitKind.BPT_IN_FOR_EXACT_TOKENS_OUT,
};
