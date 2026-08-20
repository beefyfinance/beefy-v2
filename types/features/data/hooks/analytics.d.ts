import type { GraphBucket } from '../../../helpers/graph/types';
import type { VaultEntity } from '../entities/vault';
export declare const useVaultIdToShareToUnderlying: (vaultId: VaultEntity["id"], timeBucket: GraphBucket) => {
    data: import("../apis/databarn/databarn-types").DatabarnProductPriceRow[];
    loading: boolean;
    willRetry: boolean;
};
export declare const useVaultIdToClmPriceHistory: (vaultId: VaultEntity["id"], timeBucket: GraphBucket) => {
    data: import("../apis/clm/clm-api-types").ClmPriceHistoryEntryClm[];
    loading: boolean;
    willRetry: boolean;
};
export declare const useVaultIdToClassicPriceHistory: (vaultId: VaultEntity["id"], timeBucket: GraphBucket) => {
    data: import("../apis/clm/clm-api-types").ClmPriceHistoryEntryClassic[];
    loading: boolean;
    willRetry: boolean;
};
