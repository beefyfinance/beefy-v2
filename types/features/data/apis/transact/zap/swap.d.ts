import type { BeefyState } from '../../../store/types';
import type { ISwapAggregator } from '../swap/ISwapAggregator';
import type { QuoteResponse } from '../swap/ISwapProvider';
import type { ZapStepRequest, ZapStepResponse } from './types';
export type ZapAggregatorSwapRequest = ZapStepRequest & {
    providerId: string;
    quote: QuoteResponse;
};
export type ZapAggregatorSwapResponse = ZapStepResponse;
export declare function fetchZapAggregatorSwap(request: ZapAggregatorSwapRequest, swapAggregator: ISwapAggregator, state: BeefyState): Promise<ZapAggregatorSwapResponse>;
