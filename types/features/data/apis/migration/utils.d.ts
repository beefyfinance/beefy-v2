import type { BaseUserData, ExecuteFn, UpdateFn } from './migration-types';
import type { BuildExecuteOptions, BuildUnstakeCallFn, BuildUpdateOptions, FetchBalanceFn } from './utils-types';
export declare function buildUpdate<TId extends string = string>(id: TId, fetchBalance: FetchBalanceFn, { useDepositTokenSymbol }?: BuildUpdateOptions): UpdateFn<TId>;
export declare function buildExecute<TId extends string = string, TData extends BaseUserData = BaseUserData>(id: TId, buildUnstakeCall: BuildUnstakeCallFn<TId, TData>, { depositMax }?: BuildExecuteOptions): ExecuteFn<TId, TData>;
