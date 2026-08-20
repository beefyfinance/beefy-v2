import type { PointStructureEntity } from '../entities/points';
export type FulfilledInitPointsPayload = {
    structures: PointStructureEntity[];
};
export declare const initPoints: import("@reduxjs/toolkit").AsyncThunk<FulfilledInitPointsPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
