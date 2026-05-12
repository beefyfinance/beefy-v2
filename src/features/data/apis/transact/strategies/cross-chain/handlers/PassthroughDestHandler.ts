import type BigNumber from 'bignumber.js';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
} from './types.ts';

type PassthroughState = Record<string, never>;

/**
 * Passthrough dest handler: empty dst route, bridge token delivered straight to user.
 * No recovery — bridge token IS the expected output, nothing to redo.
 */
export class PassthroughDestHandler implements IDestHandler<PassthroughState> {
  readonly kind = 'passthrough' as const;

  async fetchQuote(
    bridgeTokenIn: BigNumber,
    ctx: DestHandlerContext
  ): Promise<DestHandlerQuote<PassthroughState>> {
    return {
      destSteps: [],
      outputs: [{ token: ctx.destBridgeToken, amount: bridgeTokenIn }],
      returned: [],
      dustTokens: [],
      allowances: [],
      state: {},
    };
  }

  async fetchZapSteps(
    _quote: DestHandlerQuote<PassthroughState>,
    ctx: DestHandlerContext
  ): Promise<DestHandlerSteps> {
    return {
      zapSteps: [],
      orderOutputs: [{ token: ctx.destBridgeToken.address, minOutputAmount: '0' }],
      expectedTokens: [ctx.destBridgeToken],
    };
  }
}
