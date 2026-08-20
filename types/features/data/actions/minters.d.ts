import type BigNumber from 'bignumber.js';
import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import type { MinterConfig } from '../apis/config-types';
import type { FetchMinterReservesResult } from '../apis/minter/minter-types';
import type { ChainEntity } from '../entities/chain';
import type { MinterEntity } from '../entities/minter';
import type { BeefyState } from '../store/types';
export interface FulfilledAllMintersPayload {
    byChainId: {
        [chainId in ChainEntity['id']]?: MinterConfig[];
    };
    state: BeefyState;
}
export declare const fetchAllMinters: import("@reduxjs/toolkit").AsyncThunk<FulfilledAllMintersPayload, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface InitMinterFormParams {
    minterId: MinterEntity['id'];
    walletAddress: string | undefined;
}
interface InitMinterFormPayload {
    minterId: MinterEntity['id'];
    walletAddress: string | undefined;
    balance: FetchAllBalancesResult;
    allowance: TokenAllowance[];
    reserves: BigNumber;
    totalSupply: BigNumber;
    state: BeefyState;
}
export declare const initiateMinterForm: import("@reduxjs/toolkit").AsyncThunk<InitMinterFormPayload, InitMinterFormParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export interface ReloadReservesParams {
    chainId: ChainEntity['id'];
    minterId: MinterEntity['id'];
}
export type ReloadReservesFulfilledPayload = FetchMinterReservesResult;
export declare const reloadReserves: import("@reduxjs/toolkit").AsyncThunk<FetchMinterReservesResult, ReloadReservesParams, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
