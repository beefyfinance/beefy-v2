import type BigNumber from 'bignumber.js';
import type { DestHandlerContext, DestHandlerQuote, IDestHandler } from './types.ts';

/**
 * Passthrough destination handler — used when a withdrawal delivers the
 * bridge token straight to the user on the destination chain (today's
 * "Path A").
 *
 * Emits no dst-side zap steps and does not reconstruct a dst-chain payload.
 * The orchestrator detects passthrough via `isReconstructDestHandler(h)` and
 * emits `buildBurnZapStepPassthrough` (no hookData) for the CCTP burn.
 *
 * No recovery hooks: passthrough cannot fail on the dst chain — the bridge
 * token is minted directly to the user's wallet by CCTP.
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
}
