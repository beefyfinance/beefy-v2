import type BigNumber from 'bignumber.js';
import type { DestHandlerContext, DestHandlerQuote, DestHandlerSteps, IDestHandler, PassthroughState } from '../../../handlers/types';
/**
 * Passthrough dest handler: empty dst route, the handler's input token delivered straight to user.
 * No recovery — the input token IS the expected output, nothing to redo.
 */
export declare class PassthroughDestHandler implements IDestHandler<PassthroughState> {
    readonly kind: "passthrough";
    fetchQuote(inputAmount: BigNumber, ctx: DestHandlerContext): Promise<DestHandlerQuote<PassthroughState>>;
    fetchZapSteps(_quote: DestHandlerQuote<PassthroughState>, ctx: DestHandlerContext): Promise<DestHandlerSteps>;
}
