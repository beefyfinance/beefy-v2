import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { isTokenEqual, type TokenErc20 } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import {
  selectVaultByIdWithReceipt,
  selectVaultPricePerFullShare,
} from '../../../../selectors/vaults.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { mooAmountToOracleAmount } from '../../../../utils/ppfs.ts';
import { getTransactApi } from '../../../instances.ts';
import {
  isZapQuote,
  type InputTokenAmount,
  type WithdrawOption,
  type ZapWithdrawQuote,
} from '../../transact-types.ts';
import { isComposableStrategy, type IStrategy } from '../../strategies/IStrategy.ts';
import { collectIntermediateTokens } from '../dust.ts';
import type {
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
  SourceHandlerSteps,
} from '../types.ts';

type StrategyMatch = { strategy: IStrategy; option: WithdrawOption };

/** Strategy is re-resolved at step time (via underlyingQuote.strategyId) to avoid stale state across RPC calls. */
type VaultSourceState = {
  underlyingQuote: ZapWithdrawQuote;
};

/**
 * Vault source handler: withdraw vault shares into the handler's `outputToken`.
 * `slippageAppliesToOutput` is hard-coded true — vault withdraws always slip.
 */
export class VaultSourceHandler implements ISourceHandler<VaultSourceState> {
  readonly kind = 'vault' as const;

  constructor(private readonly srcVaultId: VaultEntity['id']) {}

  async fetchQuote(
    input: InputTokenAmount,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerQuote<VaultSourceState>> {
    const srcHelpers = await ctx.resolveHelpersForVault(this.srcVaultId);
    const strategies = await (await getTransactApi()).getZapStrategiesForVault(srcHelpers);

    const match = await VaultSourceHandler.findStrategyForOutputWithdraw(
      strategies,
      ctx.outputToken
    );
    if (!match) {
      throw new Error(
        `[vault-source] No composable vault strategy can withdraw to output token on chain ${ctx.sourceChainId} for vault ${this.srcVaultId}`
      );
    }

    const adaptedInput = this.adaptInputToStrategy(input, match, srcHelpers.getState());
    const underlyingQuote = await match.strategy.fetchWithdrawQuote([adaptedInput], match.option);
    if (!isZapQuote(underlyingQuote)) {
      throw new Error(
        `[vault-source] Composable strategy '${match.strategy.id}' returned a non-zap withdraw quote`
      );
    }

    const outputTokenAmount = underlyingQuote.outputs.find(
      o => o.token.address.toLowerCase() === ctx.outputToken.address.toLowerCase()
    );
    if (!outputTokenAmount || outputTokenAmount.amount.lte(BIG_ZERO)) {
      throw new Error('Withdrawal did not produce output token');
    }

    const dustTokens = collectIntermediateTokens({
      anchorToken: ctx.outputToken,
      inputs: [input],
      picks: {
        outputs: underlyingQuote.outputs,
        inputs: underlyingQuote.inputs,
        returned: underlyingQuote.returned,
      },
      swapSteps: underlyingQuote.steps,
    });

    return {
      sourceSteps: [...underlyingQuote.steps],
      outputAmount: outputTokenAmount.amount,
      allowances: underlyingQuote.allowances,
      returned: underlyingQuote.returned,
      dustTokens,
      slippageAppliesToOutput: true,
      state: { underlyingQuote },
    };
  }

  async fetchZapSteps(
    quote: SourceHandlerQuote<VaultSourceState>,
    ctx: SourceHandlerContext
  ): Promise<SourceHandlerSteps> {
    const srcHelpers = await ctx.resolveHelpersForVault(this.srcVaultId);
    const strategies = await (await getTransactApi()).getZapStrategiesForVault(srcHelpers);

    const { underlyingQuote } = quote.state;
    const strategy = strategies.find(s => s.id === underlyingQuote.strategyId);
    if (!strategy || !isComposableStrategy(strategy)) {
      throw new Error(
        `[vault-source] Source withdraw strategy '${underlyingQuote.strategyId}' on chain ${ctx.sourceChainId} is not composable`
      );
    }

    const breakdown = await strategy.fetchWithdrawUserlessZapBreakdown(underlyingQuote);

    return {
      zapSteps: breakdown.zapRequest.steps,
      orderInputs: breakdown.zapRequest.order.inputs,
      orderOutputs: breakdown.zapRequest.order.outputs,
    };
  }

  // Adapt source vault's shareToken input to what the matched underlying strategy declares
  private adaptInputToStrategy(
    input: InputTokenAmount,
    match: StrategyMatch,
    state: BeefyState
  ): InputTokenAmount {
    const expectedToken = match.option.inputs[0];
    if (isTokenEqual(expectedToken, input.token)) return input;

    const srcVault = selectVaultByIdWithReceipt(state, this.srcVaultId);
    const inputIsShare =
      input.token.address.toLowerCase() === srcVault.receiptTokenAddress.toLowerCase();
    const expectedIsDeposit =
      expectedToken.address.toLowerCase() === srcVault.depositTokenAddress.toLowerCase();
    if (!inputIsShare || !expectedIsDeposit) {
      throw new Error(
        `[vault-source] Boundary translator cannot adapt input ${input.token.symbol} → ${expectedToken.symbol} for vault ${this.srcVaultId} (matched strategy '${match.strategy.id}'). Expected source vault shareToken → depositToken.`
      );
    }
    return {
      token: expectedToken,
      amount: mooAmountToOracleAmount(
        input.token,
        expectedToken,
        selectVaultPricePerFullShare(state, this.srcVaultId),
        input.amount
      ),
      max: input.max,
    };
  }

  /** Find a composable src strategy whose withdraw produces the output token; identity case is handled by SingleStrategy's identity option. */
  private static async findStrategyForOutputWithdraw(
    strategies: IStrategy[],
    outputToken: TokenErc20 | { address: string }
  ): Promise<StrategyMatch | undefined> {
    for (const strategy of strategies) {
      if (!isComposableStrategy(strategy)) continue;
      try {
        const options = await strategy.fetchWithdrawOptions();
        const matched = options.find(
          o =>
            o.wantedOutputs.length === 1 &&
            o.wantedOutputs[0].address.toLowerCase() === outputToken.address.toLowerCase()
        );
        if (matched) {
          return { strategy, option: matched };
        }
      } catch (err) {
        console.warn(
          `[vault-source] findStrategyForOutputWithdraw: strategy '${strategy.id}' failed`,
          err
        );
      }
    }

    return undefined;
  }
}
