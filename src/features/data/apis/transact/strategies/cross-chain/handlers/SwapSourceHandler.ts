import { BIG_ZERO, toWeiString } from '../../../../../../../helpers/big-number.ts';
import { isTokenErc20 } from '../../../../../entities/token.ts';
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
import { collectIntermediateTokens } from '../../../handlers/dust.ts';
import type {
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
  SourceHandlerSteps,
} from '../../../handlers/types.ts';

type SwapSourceState = {
  input: InputTokenAmount;
  /** Present only when the input token is not already the output token. */
  swapStep: ZapQuoteStepSwapAggregator | undefined;
};

/**
 * Swap source handler: aggregator swap from input token to the handler's output token before
 * the CCTP burn. Produces at most one swap step (none if input is already the output token).
 */
export class SwapSourceHandler implements ISourceHandler<SwapSourceState> {
  readonly kind = 'swap' as const;

  constructor(private readonly swapConfig: StrategySwapConfig | undefined) {}

  async fetchQuote(
    input: InputTokenAmount,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerQuote<SwapSourceState>> {
    const { helpers, outputToken, pageVaultId, sourceChainId } = ctx;
    const state = helpers.getState();
    const { swapAggregator } = helpers;

    const isDirectOutput = input.token.address.toLowerCase() === outputToken.address.toLowerCase();
    const sourceSteps: ZapQuoteStep[] = [];
    let outputAmount = input.amount;
    let swapStep: ZapQuoteStepSwapAggregator | undefined;

    if (!isDirectOutput) {
      const quotes = await swapAggregator.fetchQuotes(
        {
          fromToken: input.token,
          fromAmount: input.amount,
          toToken: outputToken,
          vaultId: pageVaultId,
        },
        state,
        this.swapConfig
      );
      if (!quotes.length) {
        throw new Error('No swap quotes available for source chain swap');
      }
      const bestSwap = quotes[0];
      outputAmount = bestSwap.toAmount;
      swapStep = {
        type: 'swap',
        via: 'aggregator',
        providerId: bestSwap.providerId,
        fee: bestSwap.fee,
        quote: bestSwap,
        fromToken: input.token,
        fromAmount: input.amount,
        toToken: outputToken,
        toAmount: bestSwap.toAmount,
      };
      sourceSteps.push(swapStep);
    }

    const sourceZap = selectZapByChainId(state, sourceChainId);
    if (!sourceZap) {
      throw new Error(`No zap router on source chain ${sourceChainId}`);
    }

    const allowances =
      input.amount.gt(BIG_ZERO) && isTokenErc20(input.token) ?
        [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: sourceZap.manager,
          },
        ]
      : [];

    const dustTokens = collectIntermediateTokens({
      anchorToken: outputToken,
      inputs: [input],
      swapSteps: swapStep ? [swapStep] : undefined,
    });

    return {
      sourceSteps,
      outputAmount,
      allowances,
      returned: [],
      dustTokens,
      slippageAppliesToOutput: !isDirectOutput,
      state: { input, swapStep },
    };
  }

  async fetchZapSteps(
    quote: SourceHandlerQuote<SwapSourceState>,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerSteps> {
    const { helpers, sourceChainId, outputToken } = ctx;
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

    const minOutputAmount = minBalances.get(outputToken);

    const orderInputs: OrderInput[] = [
      {
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      },
    ];

    const orderOutputs: OrderOutput[] = [
      {
        token: getTokenAddress(outputToken),
        minOutputAmount: toWeiString(minOutputAmount, outputToken.decimals),
      },
    ];

    return {
      zapSteps,
      orderInputs,
      orderOutputs,
    };
  }
}
