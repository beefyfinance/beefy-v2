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
import { isSerializableError } from '../../strategies/error.ts';
import { withBoost, withBoostShares } from '../../strategies/boost/BoostStrategy.ts';
import {
  type IComposableStrategy,
  isComposableStrategy,
  type IStrategy,
  type ZapTransactHelpers,
} from '../../strategies/IStrategy.ts';
import { collectIntermediateTokens } from '../dust.ts';
import type {
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
  SourceHandlerSteps,
} from '../types.ts';
import type BigNumber from 'bignumber.js';

type StrategyCandidates = { strategy: IComposableStrategy; options: WithdrawOption[] };
type CandidateQuote = { quote: ZapWithdrawQuote; outputAmount: BigNumber };

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
    const srcHelpers = withBoostShares(
      await ctx.resolveHelpersForVault(this.srcVaultId),
      ctx.boostId
    );
    const strategies = await (await getTransactApi()).getInnerZapStrategiesForVault(srcHelpers);

    const candidates = await VaultSourceHandler.findWithdrawCandidates(strategies, ctx.outputToken);
    if (!candidates.length) {
      throw new Error(
        `[vault-source] No composable vault strategy can withdraw to output token on chain ${ctx.sourceChainId} for vault ${this.srcVaultId}`
      );
    }

    const { quote: underlyingQuote, outputAmount } = await this.quoteBestCandidate(
      candidates,
      input,
      srcHelpers,
      ctx
    );

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
      outputAmount,
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
    const srcHelpers = withBoostShares(
      await ctx.resolveHelpersForVault(this.srcVaultId),
      ctx.boostId
    );
    const strategies = await (await getTransactApi()).getInnerZapStrategiesForVault(srcHelpers);

    const { underlyingQuote } = quote.state;
    const found = strategies.find(s => s.id === underlyingQuote.strategyId);
    if (!found || !isComposableStrategy(found)) {
      throw new Error(
        `[vault-source] Source withdraw strategy '${underlyingQuote.strategyId}' on chain ${ctx.sourceChainId} is not composable`
      );
    }
    const strategy = withBoost(found, srcHelpers, ctx.boostId);

    await strategy.beforeStep?.();
    const breakdown = await strategy.fetchWithdrawUserlessZapBreakdown(underlyingQuote);

    return {
      zapSteps: breakdown.zapRequest.steps,
      orderInputs: breakdown.zapRequest.order.inputs,
      orderOutputs: breakdown.zapRequest.order.outputs,
    };
  }

  // A strategy can offer several routes to the same token (e.g. pool swap vs aggregator); quote them all and keep the best
  private async quoteBestCandidate(
    candidates: StrategyCandidates[],
    input: InputTokenAmount,
    srcHelpers: ZapTransactHelpers,
    ctx: SourceHandlerContext
  ): Promise<CandidateQuote> {
    const state = srcHelpers.getState();
    const quoted: CandidateQuote[] = [];
    const failures: unknown[] = [];
    for (const { strategy, options } of candidates) {
      const wrapped: IStrategy = withBoost(strategy, srcHelpers, ctx.boostId);
      await wrapped.beforeQuote?.();
      const results = await Promise.allSettled(
        options.map(async option => {
          const adaptedInput = this.adaptInputToStrategy(input, option, strategy.id, state);
          const quote = await wrapped.fetchWithdrawQuote([adaptedInput], option);
          if (!isZapQuote(quote)) {
            throw new Error(
              `[vault-source] Composable strategy '${strategy.id}' returned a non-zap withdraw quote`
            );
          }
          const output = quote.outputs.find(
            o => o.token.address.toLowerCase() === ctx.outputToken.address.toLowerCase()
          );
          if (!output || output.amount.lte(BIG_ZERO)) {
            throw new Error('Withdrawal did not produce output token');
          }
          return { quote, outputAmount: output.amount };
        })
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          quoted.push(result.value);
        } else {
          console.warn(`[vault-source] quote via '${strategy.id}' failed`, result.reason);
          failures.push(result.reason);
        }
      }
    }

    const best = quoted.reduce<CandidateQuote | undefined>(
      (acc, c) => (acc && acc.outputAmount.gte(c.outputAmount) ? acc : c),
      undefined
    );
    if (!best) {
      // prefer typed errors (e.g. CLM not calm / locked) so the UI shows its retry alert
      throw (
        failures.find(isSerializableError) ??
        new Error(
          `[vault-source] No withdraw route to output token could be quoted for vault ${this.srcVaultId}`
        )
      );
    }
    return best;
  }

  // Adapt source vault's shareToken input to what the matched underlying strategy declares
  private adaptInputToStrategy(
    input: InputTokenAmount,
    option: WithdrawOption,
    strategyId: IStrategy['id'],
    state: BeefyState
  ): InputTokenAmount {
    const expectedToken = option.inputs[0];
    if (isTokenEqual(expectedToken, input.token)) return input;

    const srcVault = selectVaultByIdWithReceipt(state, this.srcVaultId);
    const inputIsShare =
      input.token.address.toLowerCase() === srcVault.receiptTokenAddress.toLowerCase();
    const expectedIsDeposit =
      expectedToken.address.toLowerCase() === srcVault.depositTokenAddress.toLowerCase();
    if (!inputIsShare || !expectedIsDeposit) {
      throw new Error(
        `[vault-source] Boundary translator cannot adapt input ${input.token.symbol} → ${expectedToken.symbol} for vault ${this.srcVaultId} (matched strategy '${strategyId}'). Expected source vault shareToken → depositToken.`
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

  /** Every composable src strategy option whose withdraw produces the output token; identity case is handled by SingleStrategy's identity option. */
  private static async findWithdrawCandidates(
    strategies: IStrategy[],
    outputToken: TokenErc20 | { address: string }
  ): Promise<StrategyCandidates[]> {
    const candidates: StrategyCandidates[] = [];
    for (const strategy of strategies) {
      if (!isComposableStrategy(strategy)) continue;
      try {
        const options = await strategy.fetchWithdrawOptions();
        const matched = options.filter(
          o =>
            o.wantedOutputs.length === 1 &&
            o.wantedOutputs[0].address.toLowerCase() === outputToken.address.toLowerCase()
        );
        if (matched.length) {
          candidates.push({ strategy, options: matched });
        }
      } catch (err) {
        console.warn(
          `[vault-source] findWithdrawCandidates: strategy '${strategy.id}' failed`,
          err
        );
      }
    }

    return candidates;
  }
}
