import type { AnyAction, Dispatch, MiddlewareAPI } from 'redux';
import type { BeefyState } from '../store/types';
export declare const loggerMiddleware: ({ getState }: MiddlewareAPI<Dispatch, BeefyState>) => (next: Dispatch) => (action: AnyAction) => AnyAction;
