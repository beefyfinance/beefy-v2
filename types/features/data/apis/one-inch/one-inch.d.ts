import type { IOneInchApi, QuoteRequest, QuoteResponse, SwapRequest, SwapResponse } from './one-inch-types';
import type { ChainEntity } from '../../entities/chain';
import type { ChainConfig } from '../config-types';
export declare const supportedChainIds: ChainConfig['id'][];
export declare class OneInchApi implements IOneInchApi {
    protected chain: ChainEntity;
    protected api: string;
    constructor(chain: ChainEntity);
    protected get<ResponseType extends object, RequestType extends Record<string, string | number | boolean>>(url: string, request: RequestType): Promise<ResponseType>;
    getQuote(request: QuoteRequest): Promise<QuoteResponse>;
    getSwap(request: SwapRequest): Promise<SwapResponse>;
}
