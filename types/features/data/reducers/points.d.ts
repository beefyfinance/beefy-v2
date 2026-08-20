import type { PointsState } from './points-types';
export declare const initialPointsState: PointsState;
export declare const pointsSlice: import("@reduxjs/toolkit").Slice<PointsState, {}, "points", "points", import("@reduxjs/toolkit").SliceSelectors<PointsState>>;
export declare const pointsReducer: import("redux").Reducer<PointsState>;
