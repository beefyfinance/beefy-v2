import type { OptionalRecord } from '../../../../utils/types-utils';
import { PoolExitKind, PoolJoinKind } from '../common/types';
import { ComposableStablePoolExitKind, ComposableStablePoolJoinKind } from './types';
export declare const poolJoinKindToComposableStablePoolJoinKind: OptionalRecord<PoolJoinKind, ComposableStablePoolJoinKind>;
export declare const poolExitKindToComposableStablePoolExitKind: OptionalRecord<PoolExitKind, ComposableStablePoolExitKind>;
