import type { BoostContractData } from '../apis/contract-data/contract-data-types';
import type { PromosState } from './promos-types';
export declare const initialPromosState: PromosState;
export declare const promosSlice: import("@reduxjs/toolkit").Slice<PromosState, {
    recalculatePromoStatuses: (sliceState: import("immer").WritableDraft<PromosState>) => void;
}, "promos", "promos", import("@reduxjs/toolkit").SliceSelectors<PromosState>>;
export declare function getBoostStatusFromContractState(contractState: Pick<BoostContractData, 'isPreStake' | 'periodFinish'>, now?: number): "active" | "prestake" | "inactive";
export declare const recalculatePromoStatuses: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"promos/recalculatePromoStatuses">;
export declare const promosReducer: import("redux").Reducer<PromosState>;
