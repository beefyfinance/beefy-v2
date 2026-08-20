import { PoolExitKind, PoolJoinKind } from '../common/types';
import type { OptionalRecord } from '../../../../utils/types-utils';
import { GyroPoolExitKind, GyroPoolJoinKind } from './types';
export declare const poolJoinKindToGyroPoolJoinKind: OptionalRecord<PoolJoinKind, GyroPoolJoinKind>;
export declare const poolExitKindToGyroPoolExitKind: OptionalRecord<PoolExitKind, GyroPoolExitKind>;
