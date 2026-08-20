import type { IKyberSwapApi, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './kyber-types';
import type { ChainEntity } from '../../entities/chain';
import type { ChainConfig } from '../config-types';
export declare const supportedChainIds: ChainConfig['id'][];
export declare class KyberSwapApi implements IKyberSwapApi {
    protected chain: ChainEntity;
    protected api: string;
    constructor(chain: ChainEntity);
    protected get<ResponseType extends object, RequestType extends Record<string, string | number | boolean | string[]>>(url: string, request: RequestType): Promise<ResponseType>;
    protected post<ResponseType extends object, RequestType extends Record<string, unknown>>(url: string, request: RequestType): Promise<ResponseType>;
    getQuote(request: QuoteRequest): Promise<QuoteResponse>;
    postSwap(request: SwapRequest): Promise<SwapResponse>;
}
