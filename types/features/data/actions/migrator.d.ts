import type { ExecutePayload, MigratorExecuteParams, MigratorLoadParams, MigratorLoadPayload, MigratorUpdateParams, UpdatePayload } from '../apis/migration/migration-types';
export declare const migratorLoad: import("@reduxjs/toolkit").AsyncThunk<MigratorLoadPayload, MigratorLoadParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const migratorUpdate: import("@reduxjs/toolkit").AsyncThunk<UpdatePayload, MigratorUpdateParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const migratorExecute: import("@reduxjs/toolkit").AsyncThunk<ExecutePayload, MigratorExecuteParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
