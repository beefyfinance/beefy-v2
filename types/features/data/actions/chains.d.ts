import type { ChainConfig } from '../apis/config-types';
import type { ChainEntity } from '../entities/chain';
export interface FulfilledPayload {
    chainConfigs: ChainConfig[];
    localRpcs: Partial<Record<ChainEntity['id'], string[]>>;
}
export declare const fetchChainConfigs: import("@reduxjs/toolkit").AsyncThunk<FulfilledPayload, void, {
    state: import("../store/types").BeefyState;
    dispatch: import("../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
export declare const updateActiveRpc: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[chain: ChainEntity, rpcUrl: string], {
    chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood";
    rpcUrl: string;
}, "updateActiveRpc", never, never>;
export declare const restoreDefaultRpcsOnSingleChain: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[chain: ChainEntity], {
    chainId: "ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood";
}, "restoreDefaultRpcsOnSingleChain", never, never>;
