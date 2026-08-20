import type { CuratorEntity } from '../entities/curator';
import type { BeefyState } from '../store/types';
export declare const selectCuratorByIdOrUndefined: (state: BeefyState, curatorId: CuratorEntity["id"]) => CuratorEntity | undefined;
export declare const selectCuratorById: (state: BeefyState, curatorId: CuratorEntity["id"]) => CuratorEntity;
