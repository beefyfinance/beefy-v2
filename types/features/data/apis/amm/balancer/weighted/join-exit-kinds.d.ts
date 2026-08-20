import { PoolExitKind, PoolJoinKind } from '../common/types';
import type { OptionalRecord } from '../../../../utils/types-utils';
import { WeightedPoolExitKind, WeightedPoolJoinKind } from './types';
export declare const poolJoinKindToWeightedPoolJoinKind: OptionalRecord<PoolJoinKind, WeightedPoolJoinKind>;
export declare const poolExitKindToWeightedPoolExitKind: OptionalRecord<PoolExitKind, WeightedPoolExitKind>;
