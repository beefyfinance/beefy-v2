import type { TokenEntity } from '../../../entities/token';
import { type InputTokenAmount, type TokenAmount, type ZapQuoteStep } from '../transact-types';
import type { OrderOutput } from '../zap/types';
export type IntermediateTokenConfig = {
    /** Caller's boundary token — the source handler's output, or the dest handler's input. */
    anchorToken: TokenEntity;
    inputs?: InputTokenAmount[];
    picks?: {
        outputs: TokenAmount[];
        inputs: InputTokenAmount[];
        returned: TokenAmount[];
    };
    swapSteps?: ZapQuoteStep[];
};
/** Collect tokens to emit as dust outputs (min=0 router refunds). */
export declare function collectIntermediateTokens(config: IntermediateTokenConfig): TokenEntity[];
export declare function buildDustOutputs(tokens: TokenEntity[]): OrderOutput[];
export declare function mergeOutputs(required: OrderOutput[], dust: OrderOutput[]): OrderOutput[];
