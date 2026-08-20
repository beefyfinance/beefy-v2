import { type TypedStartListening } from '@reduxjs/toolkit';
import type { BeefyDispatchFn, BeefyState } from '../store/types';
export type AppStartListening = TypedStartListening<BeefyState, BeefyDispatchFn>;
export declare const startAppListening: AppStartListening;
export declare const listenerMiddleware: import("@reduxjs/toolkit").ListenerMiddleware<unknown, import("redux-thunk").ThunkDispatch<unknown, unknown, import("redux").UnknownAction>, unknown>;
