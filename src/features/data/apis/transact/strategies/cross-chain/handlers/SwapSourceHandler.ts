import { BIG_ZERO, toWeiString } from '../../../../../../../helpers/big-number.ts';
import type { TokenErc20 } from '../../../../../entities/token.ts';
import { selectTransactSlippage } from '../../../../../selectors/transact.ts';
import { selectZapByChainId } from '../../../../../selectors/zap.ts';
import { Balances } from '../../../helpers/Balances.ts';
import { getTokenAddress } from '../../../helpers/zap.ts';
import {
  isZapQuoteStepSwapAggregator,
  type InputTokenAmount,
  type ZapQuoteStep,
  type ZapQuoteStepSwapAggregator,
} from '../../../transact-types.ts';
import { fetchZapAggregatorSwap } from '../../../zap/swap.ts';
import type { OrderInput, OrderOutput, ZapStep } from '../../../zap/types.ts';
import type { StrategySwapConfig } from '../../strategy-configs.ts';
import { collectIntermediateTokens } from './dust.ts';
import type {
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
  SourceHandlerSteps,
} from './types.ts';

/**
 * State preserved between `fetchQuote` and `fetchZapSteps` for the swap
 * source handler.
 */
type SwapSourceState = {
  input: InputTokenAmount;
  /** Present only when the input token is not already the bridge token. */
  swapStep: ZapQuoteStepSwapAggregator | undefined;
};

/**
 * Source handler for the "token-in → bridge-token via aggregator swap" flow —
 * pre-bridge source behavior (swap-src). The handler produces at most one swap
 * step (none if the input is already the bridge token); the bridge step is the
 * orchestrator's concern and is appended outside the handler.
 *
 * `slippageAppliesToBridge` is true whenever a swap ran, matching the
 * `sourceSteps.length > 0` gate in the orchestrator's deposit quote.
 */
export class SwapSourceHandler implements ISourceHandler<SwapSourceState> {
  readonly kind = 'swap' as const;

  constructor(private readonly swapConfig: StrategySwapConfig | undefined) {}

  async fetchQuote(
    input: InputTokenAmount,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerQuote<SwapSourceState>> {
    const { helpers, bridgeToken, pageVaultId, sourceChainId } = ctx;
    const state = helpers.getState();
    const { swapAggregator } = helpers;

    const isDirectBridgeToken =
      input.token.address.toLowerCase() === bridgeToken.address.toLowerCase();
    const sourceSteps: ZapQuoteStep[] = [];
    let bridgeTokenOut = input.amount;
    let swapStep: ZapQuoteStepSwapAggregator | undefined;

    if (!isDirectBridgeToken) {
      const quotes = await swapAggregator.fetchQuotes(
        {
          fromToken: input.token,
          fromAmount: input.amount,
          toToken: bridgeToken,
          vaultId: pageVaultId,
        },
        state,
        this.swapConfig
      );
      if (!quotes.length) {
        throw new Error('No swap quotes available for source chain swap');
      }
      const bestSwap = quotes[0];
      bridgeTokenOut = bestSwap.toAmount;
      swapStep = {
        type: 'swap',
        via: 'aggregator',
        providerId: bestSwap.providerId,
        fee: bestSwap.fee,
        quote: bestSwap,
        fromToken: input.token,
        fromAmount: input.amount,
        toToken: bridgeToken,
        toAmount: bestSwap.toAmount,
      };
      sourceSteps.push(swapStep);
    }

    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    const allowances =
      input.amount.gt(BIG_ZERO) ?
        [
          {
            token: input.token as TokenErc20,
            amount: input.amount,
            spenderAddress: sourceZap.manager,
          },
        ]
      : [];

    const dustTokens = collectIntermediateTokens({
      context: 'deposit-source',
      inputs: [input],
      bridgeToken,
      swapStep,
    });

    return {
      sourceSteps,
      bridgeTokenOut,
      allowances,
      returned: [],
      dustTokens,
      slippageAppliesToBridge: !isDirectBridgeToken,
      state: { input, swapStep },
    };
  }

  async fetchZapSteps(
    quote: SourceHandlerQuote<SwapSourceState>,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerSteps> {
    const { helpers, sourceChainId, bridgeToken } = ctx;
    const state = helpers.getState();
    const { swapAggregator } = helpers;
    const slippage = selectTransactSlippage(state);

    const { input, swapStep } = quote.state;
    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    const zapSteps: ZapStep[] = [];
    const minBalances = new Balances([input]);

    if (swapStep && isZapQuoteStepSwapAggregator(swapStep)) {
      const swapZap = await fetchZapAggregatorSwap(
        {
          quote: swapStep.quote,
          inputs: [{ token: swapStep.fromToken, amount: swapStep.fromAmount }],
          outputs: [{ token: swapStep.toToken, amount: swapStep.toAmount }],
          maxSlippage: slippage,
          zapRouter: sourceZap.router,
          providerId: swapStep.providerId,
          insertBalance: true,
        },
        swapAggregator,
        state
      );
      swapZap.zaps.forEach(s => zapSteps.push(s));
      minBalances.subtractMany(swapZap.inputs);
      minBalances.addMany(swapZap.minOutputs);
    }

    const minBridgeAmount = minBalances.get(bridgeToken);

    const orderInputs: OrderInput[] = [
      {
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      },
    ];

    const orderOutputs: OrderOutput[] = [
      {
        token: getTokenAddress(bridgeToken),
        minOutputAmount: toWeiString(minBridgeAmount, bridgeToken.decimals),
      },
    ];

    return {
      zapSteps,
      orderInputs,
      orderOutputs,
    };
  }
}
