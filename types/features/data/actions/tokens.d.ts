import type { ChainAddressBook } from '../apis/addressbook';
import type { TokenAllowance } from '../apis/allowance/allowance-types';
import type { FetchAllBalancesResult } from '../apis/balance/balance-types';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import type { ChainEntity } from '../entities/chain';
import type { BoostPromoEntity } from '../entities/promo';
import type { CurrentCowcentratedRangeData, TokenEntity } from '../entities/token';
import { type VaultEntity, type VaultGov } from '../entities/vault';
interface ActionParams {
    chainId: ChainEntity['id'];
}
export interface FetchAddressBookPayload {
    chainId: ChainEntity['id'];
    addressBook: ChainAddressBook;
}
export declare const fetchAddressBookAction: import("@reduxjs/toolkit").AsyncThunk<FetchAddressBookPayload, ActionParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchAllAddressBookAction: import("@reduxjs/toolkit").AsyncThunk<FetchAddressBookPayload[], void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
interface ReloadBalanceAllowanceRewardsParams {
    chainId: ChainEntity['id'];
    tokens: TokenEntity[];
    spenderAddress: string;
    govVaultId?: VaultGov['id'];
    boostId?: BoostPromoEntity['id'];
    vaultId?: VaultEntity['id'];
    walletAddress: string;
}
export interface ReloadBalanceAllowanceRewardsFulfilledPayload {
    chainId: ChainEntity['id'];
    walletAddress: string;
    spenderAddress: string;
    balance: FetchAllBalancesResult;
    allowance: TokenAllowance[];
    contractData: FetchAllContractDataResult;
}
export type AllCurrentCowcentratedRangesPayload = Record<string, CurrentCowcentratedRangeData<string>>;
export declare const reloadBalanceAndAllowanceAndGovRewardsAndBoostData: import("@reduxjs/toolkit").AsyncThunk<ReloadBalanceAllowanceRewardsFulfilledPayload, ReloadBalanceAllowanceRewardsParams, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const fetchAllCurrentCowcentratedRanges: import("@reduxjs/toolkit").AsyncThunk<AllCurrentCowcentratedRangesPayload, void, {
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
