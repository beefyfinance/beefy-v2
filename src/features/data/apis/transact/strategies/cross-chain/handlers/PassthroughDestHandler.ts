import type BigNumber from 'bignumber.js';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
} from './types.ts';

/**
 * Passthrough destination handler — used when a withdrawal delivers the
 * bridge token straight to the user on the destination chain (today's
 * "Path A").
 *
 * Emits an empty dst-side route and a single bridge-token output. The
 * orchestrator encodes that into the same `CircleBeefyZapReceiver` hookData
 * as every other handler — the only thing that distinguishes passthrough
 * from swap/vault dst handlers is `route: []`.
 *
 * No recovery hooks: passthrough cannot fail on the dst chain — the bridge
 * token is the user's expected output; once CCTP attests, the receiver
 * forwards USDC directly to the user's wallet.
 */
type PassthroughState = Record<string, never>;

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
