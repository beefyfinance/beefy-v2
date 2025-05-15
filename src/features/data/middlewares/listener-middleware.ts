import { createListenerMiddleware, type TypedStartListening } from '@reduxjs/toolkit';
import type { BeefyDispatchFn, BeefyState } from '../store/types.ts';

const listener = createListenerMiddleware();

export type AppStartListening = TypedStartListening<BeefyState, BeefyDispatchFn>;

export const startAppListening = listener.startListening as AppStartListening;

export const listenerMiddleware = listener.middleware;
