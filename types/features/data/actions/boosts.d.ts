import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import type { BoostPromoEntity } from '../entities/promo';
interface InitBoostFormParams {
    boostId: BoostPromoEntity['id'];
    walletAddress: string | undefined;
}
interface InitBoostFormPayload {
    walletAddress: string | undefined;
    balance: FetchAllBalancesResult;
    allowance: TokenAllowance[];
    boost: BoostPromoEntity;
}
export declare const initiateBoostForm: import("@reduxjs/toolkit").AsyncThunk<InitBoostFormPayload, InitBoostFormParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export {};
