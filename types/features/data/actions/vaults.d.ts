import type { VaultConfig } from '../apis/config-types';
import type { ChainEntity } from '../entities/chain';
import { type VaultEntity } from '../entities/vault';
export interface FulfilledAllVaultsPayload {
    byChainId: {
        [chainId in ChainEntity['id']]?: {
            config: VaultConfig;
            entity: VaultEntity;
        }[];
    };
}
export declare const fetchAllVaults: import("@reduxjs/toolkit").AsyncThunk<FulfilledAllVaultsPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
type FulfilledVaultsLastHarvestPayload = {
    byVaultId: {
        [vaultId: VaultConfig['id']]: number;
    };
};
export declare const fetchVaultsLastHarvests: import("@reduxjs/toolkit").AsyncThunk<FulfilledVaultsLastHarvestPayload, void, {
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
