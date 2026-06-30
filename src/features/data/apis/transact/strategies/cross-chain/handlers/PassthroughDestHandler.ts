import type BigNumber from 'bignumber.js';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
  PassthroughState,
} from '../../../handlers/types.ts';

/**
 * Passthrough dest handler: empty dst route, the handler's input token delivered straight to user.
 * No recovery — the input token IS the expected output, nothing to redo.
 */
export class PassthroughDestHandler implements IDestHandler<PassthroughState> {
  readonly kind = 'passthrough' as const;

  async fetchQuote(
    inputAmount: BigNumber,
    ctx: DestHandlerContext
  ): Promise<DestHandlerQuote<PassthroughState>> {
    return {
      destSteps: [],
      outputs: [{ token: ctx.inputToken, amount: inputAmount }],
      returned: [],
      dustTokens: [],
      allowances: [],
      state: { kind: 'passthrough' },
    };
  }

  async fetchZapSteps(
    _quote: DestHandlerQuote<PassthroughState>,
    ctx: DestHandlerContext
  ): Promise<DestHandlerSteps> {
    return {
      zapSteps: [],
      orderOutputs: [{ token: ctx.inputToken.address, minOutputAmount: '0' }],
      expectedTokens: [ctx.inputToken],
    };
  }
}
