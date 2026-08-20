import type BigNumber from 'bignumber.js';
import { type TokenEntity } from '../../../../../entities/token';
import type { StrategySwapConfig } from '../../strategy-configs';
import type { DestHandlerContext, DestHandlerQuote, DestHandlerSteps, IDestHandler, SwapDestState } from '../../../handlers/types';
/**
 * Swap dest handler: aggregator swap from the handler's input token to the desired output token
 * on the dst chain. fetchZapSteps may run via the dst-only recovery path when hookData oversizes.
 */
export declare class SwapDestHandler implements IDestHandler<SwapDestState> {
    private readonly desiredOutput;
    private readonly swapConfig;
    readonly kind: "swap";
    constructor(desiredOutput: TokenEntity, swapConfig: StrategySwapConfig | undefined);
    fetchQuote(inputAmount: BigNumber, ctx: DestHandlerContext): Promise<DestHandlerQuote<SwapDestState>>;
    fetchZapSteps(quote: DestHandlerQuote<SwapDestState>, ctx: DestHandlerContext): Promise<DestHandlerSteps>;
}
