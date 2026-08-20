import type { FetchUserMerklRewardsActionParams, FetchUserMerklRewardsFulfilledPayload } from './merkl-user-rewards-types';
export declare const MERKL_SUPPORTED_CHAINS: Map<"ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood", `0x${string}`>;
export declare const fetchUserMerklRewardsAction: import("@reduxjs/toolkit").AsyncThunk<FetchUserMerklRewardsFulfilledPayload, FetchUserMerklRewardsActionParams, {
    state: import("../../store/types").BeefyState;
    dispatch: import("../../store/types").BeefyDispatchFn;
    extra?: unknown;
    rejectValue?: unknown;
    serializedErrorType?: unknown;
    pendingMeta?: unknown;
    fulfilledMeta?: unknown;
    rejectedMeta?: unknown;
}>;
