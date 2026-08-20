import type { VaultConfig } from '../apis/config-types';
import type { PinnedConfig } from '../apis/promos/types';
import type { PromoCampaignEntity, PromoEntity, PromoPartnerEntity } from '../entities/promo';
import type { BeefyState } from '../store/types';
export type FulfilledInitPromosPayload = {
    promos: PromoEntity[];
    partners: PromoPartnerEntity[];
    campaigns: PromoCampaignEntity[];
    pinned: PinnedConfig[];
};
export declare const initPromos: import("@reduxjs/toolkit").AsyncThunk<FulfilledInitPromosPayload, void, {
    state: BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type FulfilledVaultsPinnedPayload = {
    byId: {
        [vaultId: VaultConfig['id']]: boolean;
    };
};
export declare const promosRecalculatePinned: import("@reduxjs/toolkit").AsyncThunk<FulfilledVaultsPinnedPayload, void, {
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
