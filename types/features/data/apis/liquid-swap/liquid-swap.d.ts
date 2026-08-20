import type { ILiquidSwapApi, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './liquid-swap-types';
import type { ChainEntity } from '../../entities/chain';
export declare const supportedChainIds: Set<"ethereum" | "polygon" | "bsc" | "optimism" | "fantom" | "arbitrum" | "avax" | "cronos" | "moonbeam" | "moonriver" | "metis" | "fuse" | "kava" | "canto" | "zksync" | "zkevm" | "base" | "gnosis" | "linea" | "mantle" | "fraxtal" | "mode" | "manta" | "real" | "sei" | "rootstock" | "scroll" | "lisk" | "sonic" | "aurora" | "emerald" | "berachain" | "celo" | "heco" | "harmony" | "saga" | "hyperevm" | "plasma" | "monad" | "megaeth" | "robinhood">;
export declare class LiquidSwapApi implements ILiquidSwapApi {
    protected chain: ChainEntity;
    protected api: string;
    constructor(chain: ChainEntity);
    getQuote(request: QuoteRequest): Promise<QuoteResponse>;
    postSwap(request: SwapRequest): Promise<SwapResponse>;
    protected get<ResponseType extends object, RequestType extends Record<string, string | number | boolean | string[]>>(url: string, request: RequestType): Promise<ResponseType>;
    protected post<ResponseType extends object, RequestType extends Record<string, unknown>>(url: string, request: RequestType): Promise<ResponseType>;
}
