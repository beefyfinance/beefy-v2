export type WindowState = {
    /** Whether the browser tab is currently focused and visible */
    focused: boolean;
    /** Whether browser has network connectivity */
    online: boolean;
};
export declare const windowSlice: import("@reduxjs/toolkit").Slice<WindowState, {}, "window", "window", import("@reduxjs/toolkit").SliceSelectors<WindowState>>;
export declare const windowReducer: import("redux").Reducer<WindowState>;
