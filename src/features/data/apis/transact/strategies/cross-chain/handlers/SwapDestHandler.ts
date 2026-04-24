import type BigNumber from 'bignumber.js';
import { BIG_ZERO, toWeiString } from '../../../../../../../helpers/big-number.ts';
import type { TokenEntity, TokenErc20 } from '../../../../../entities/token.ts';
import { selectTransactSlippage } from '../../../../../selectors/transact.ts';
import { selectZapByChainId } from '../../../../../selectors/zap.ts';
import { slipBy } from '../../../helpers/amounts.ts';
import { getTokenAddress } from '../../../helpers/zap.ts';
import { type ZapQuoteStepSwapAggregator } from '../../../transact-types.ts';
import { fetchZapAggregatorSwap } from '../../../zap/swap.ts';
import type { OrderOutput } from '../../../zap/types.ts';
import type { StrategySwapConfig } from '../../strategy-configs.ts';
import { collectIntermediateTokens } from './dust.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
} from './types.ts';

/**
 * State preserved between `fetchQuote` and `fetchZapSteps` for the swap
 * destination handler.
 */
type SwapDestState = {
  swapStep: ZapQuoteStepSwapAggregator;
};

/**
 * Destination handler for the "bridge-token → desired-token via aggregator
 * swap" flow — today's "Path B" (hookData-encoded destination swap) and the
 * dst-only recovery path when that hookData overflows.
 *
 * `fetchZapSteps` produces the ZapSteps that run on the dst chain inside
 * `CircleBeefyZapReceiver` via the CCTP hook. The orchestrator owns oversize
 * detection and will fall back to passthrough + two-step recovery when the
 * hookData exceeds the CCTP message size limit; in that case
 * `CrossChainStrategy.stepDestOnly` re-invokes these same methods to build
 * the dst-chain "complete withdraw" step.
 */
export class SwapDestHandler implements IDestHandler<SwapDestState> {
  readonly kind = 'swap' as const;

  constructor(
    private readonly desiredOutput: TokenEntity,
    private readonly swapConfig: StrategySwapConfig | undefined
  ) {}

  async fetchQuote(
    bridgeTokenIn: BigNumber,
    ctx: DestHandlerContext
  ): Promise<DestHandlerQuote<SwapDestState>> {
    const { helpers, destBridgeToken, destChainId, pageVaultId } = ctx;
    const state = helpers.getState();
    const { swapAggregator } = helpers;

    const quotes = await swapAggregator.fetchQuotes(
      {
        fromToken: destBridgeToken,
        fromAmount: bridgeTokenIn,
        toToken: this.desiredOutput,
        vaultId: pageVaultId,
      },
      state,
      this.swapConfig
    );
    if (!quotes.length) {
      throw new Error('No swap quotes available for destination chain swap');
    }
    const bestSwap = quotes[0];

    const swapStep: ZapQuoteStepSwapAggregator = {
      type: 'swap',
      via: 'aggregator',
      providerId: bestSwap.providerId,
      fee: bestSwap.fee,
      quote: bestSwap,
      fromToken: destBridgeToken,
      fromAmount: bridgeTokenIn,
      toToken: this.desiredOutput,
      toAmount: bestSwap.toAmount,
    };

    const dustTokens = collectIntermediateTokens({
      context: 'withdraw-dest',
      bridgeToken: destBridgeToken,
      swapSteps: [swapStep],
    });

    const destZap = selectZapByChainId(state, destChainId);
    if (!destZap) {
      throw new Error(`No zap router on destination chain ${destChainId}`);
    }

    const allowances =
      bridgeTokenIn.gt(BIG_ZERO) ?
        [
          {
            token: destBridgeToken as TokenErc20,
            amount: bridgeTokenIn,
            spenderAddress: destZap.manager,
          },
        ]
      : [];

    return {
      destSteps: [swapStep],
      outputs: [{ token: this.desiredOutput, amount: bestSwap.toAmount }],
      returned: [],
      dustTokens,
      allowances,
      state: { swapStep },
    };
  }

  async fetchZapSteps(
    quote: DestHandlerQuote<SwapDestState>,
    ctx: DestHandlerContext
  ): Promise<DestHandlerSteps> {
    const { helpers, destChainId } = ctx;
    const state = helpers.getState();
    const { swapAggregator } = helpers;
    const slippage = selectTransactSlippage(state);

    const destZap = selectZapByChainId(state, destChainId);
    if (!destZap) {
      throw new Error(`No zap router on destination chain ${destChainId}`);
    }

    const { swapStep } = quote.state;

    const destSwapZap = await fetchZapAggregatorSwap(
      {
        quote: swapStep.quote,
        inputs: [{ token: swapStep.fromToken, amount: swapStep.fromAmount }],
        outputs: [{ token: swapStep.toToken, amount: swapStep.toAmount }],
        maxSlippage: slippage,
        zapRouter: destZap.router,
        providerId: swapStep.providerId,
        insertBalance: true,
      },
      swapAggregator,
      state
    );

    const orderOutputs: OrderOutput[] = [
      {
        token: getTokenAddress(this.desiredOutput),
        // Double slippage is intentional: minOutputs already includes aggregator slippage,
        // but the destination swap executes minutes later (after CCTP bridge), so we apply
        // additional slippage as safety margin for quote staleness.
        minOutputAmount: toWeiString(
          slipBy(destSwapZap.minOutputs[0].amount, slippage, this.desiredOutput.decimals),
          this.desiredOutput.decimals
        ),
      },
    ];

    return {
      zapSteps: destSwapZap.zaps,
      orderOutputs,
      // Declare the desiredOutput as the post-tx balance to refresh. The
      // normal cross-chain flow (balance refresh driven by
      // `selectVaultTokensToRefresh`) is a superset; the dst-only recovery
      // path relies on this list to trigger the refresh.
      expectedTokens: [this.desiredOutput],
    };
  }
}
