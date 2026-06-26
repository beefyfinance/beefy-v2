import type BigNumber from 'bignumber.js';
import { BIG_ZERO, toWeiString } from '../../../../../../../helpers/big-number.ts';
import { isTokenErc20, type TokenEntity } from '../../../../../entities/token.ts';
import { selectTransactSlippage } from '../../../../../selectors/transact.ts';
import { selectZapByChainId } from '../../../../../selectors/zap.ts';
import { slipBy } from '../../../helpers/amounts.ts';
import { getTokenAddress } from '../../../helpers/zap.ts';
import { type ZapQuoteStepSwapAggregator } from '../../../transact-types.ts';
import { fetchZapAggregatorSwap } from '../../../zap/swap.ts';
import type { OrderOutput } from '../../../zap/types.ts';
import type { StrategySwapConfig } from '../../strategy-configs.ts';
import { collectIntermediateTokens } from '../../../handlers/dust.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
} from '../../../handlers/types.ts';

type SwapDestState = {
  swapStep: ZapQuoteStepSwapAggregator;
};

/**
 * Swap dest handler: aggregator swap from the handler's input token to the desired output token
 * on the dst chain. fetchZapSteps may run via the dst-only recovery path when hookData oversizes.
 */
export class SwapDestHandler implements IDestHandler<SwapDestState> {
  readonly kind = 'swap' as const;

  constructor(
    private readonly desiredOutput: TokenEntity,
    private readonly swapConfig: StrategySwapConfig | undefined
  ) {}

  async fetchQuote(
    inputAmount: BigNumber,
    ctx: DestHandlerContext
  ): Promise<DestHandlerQuote<SwapDestState>> {
    const { helpers, inputToken, destChainId, pageVaultId } = ctx;
    const state = helpers.getState();
    const { swapAggregator } = helpers;

    const quotes = await swapAggregator.fetchQuotes(
      {
        fromToken: inputToken,
        fromAmount: inputAmount,
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
      fromToken: inputToken,
      fromAmount: inputAmount,
      toToken: this.desiredOutput,
      toAmount: bestSwap.toAmount,
    };

    const dustTokens = collectIntermediateTokens({
      anchorToken: inputToken,
      swapSteps: [swapStep],
    });

    const destZap = selectZapByChainId(state, destChainId);
    if (!destZap) {
      throw new Error(`No zap router on destination chain ${destChainId}`);
    }

    const allowances =
      inputAmount.gt(BIG_ZERO) && isTokenErc20(inputToken) ?
        [
          {
            token: inputToken,
            amount: inputAmount,
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
        minOutputAmount: toWeiString(
          slipBy(destSwapZap.minOutputs[0].amount, slippage, this.desiredOutput.decimals),
          this.desiredOutput.decimals
        ),
      },
    ];

    return {
      zapSteps: destSwapZap.zaps,
      orderOutputs,
      // Recovery path needs expectedTokens for post-tx refresh; normal flow's selectVaultTokensToRefresh covers it.
      expectedTokens: [this.desiredOutput],
    };
  }
}
