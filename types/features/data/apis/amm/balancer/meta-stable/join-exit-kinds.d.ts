import { PoolExitKind, PoolJoinKind } from '../common/types';
import type { OptionalRecord } from '../../../../utils/types-utils';
import { MetaStablePoolExitKind, MetaStablePoolJoinKind } from './types';
export declare const poolJoinKindToMetaStablePoolJoinKind: OptionalRecord<PoolJoinKind, MetaStablePoolJoinKind>;
export declare const poolExitKindToMetaStablePoolExitKind: OptionalRecord<PoolExitKind, MetaStablePoolExitKind>;
