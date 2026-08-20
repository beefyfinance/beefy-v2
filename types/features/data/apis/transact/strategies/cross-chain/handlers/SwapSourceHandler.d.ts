import { type InputTokenAmount, type ZapQuoteStepSwapAggregator } from '../../../transact-types';
import type { StrategySwapConfig } from '../../strategy-configs';
import type { ISourceHandler, SourceHandlerContext, SourceHandlerQuote, SourceHandlerSteps } from '../../../handlers/types';
type SwapSourceState = {
    input: InputTokenAmount;
    /** Present only when the input token is not already the output token. */
    swapStep: ZapQuoteStepSwapAggregator | undefined;
};
/**
 * Swap source handler: aggregator swap from input token to the handler's output token before
 * the CCTP burn. Produces at most one swap step (none if input is already the output token).
 */
export declare class SwapSourceHandler implements ISourceHandler<SwapSourceState> {
    private readonly swapConfig;
    readonly kind: "swap";
    constructor(swapConfig: StrategySwapConfig | undefined);
    fetchQuote(input: InputTokenAmount, ctx: SourceHandlerContext): Promise<SourceHandlerQuote<SwapSourceState>>;
    fetchZapSteps(quote: SourceHandlerQuote<SwapSourceState>, ctx: SourceHandlerContext): Promise<SourceHandlerSteps>;
}
export {};
