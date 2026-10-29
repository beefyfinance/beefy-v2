import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import type { TokenErc20 } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { getTransactApi } from '../../../instances.ts';
import { isZapQuote, type DepositOption, type ZapDepositQuote } from '../../transact-types.ts';
import { isSerializableError } from '../../strategies/error.ts';
import { withBoost } from '../../strategies/boost/BoostStrategy.ts';
import {
  type IComposableStrategy,
  isComposableStrategy,
  type IStrategy,
  type ZapTransactHelpers,
} from '../../strategies/IStrategy.ts';
import { collectIntermediateTokens } from '../dust.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
  VaultDestState,
} from '../types.ts';

type StrategyCandidates = { strategy: IComposableStrategy; options: DepositOption[] };

/**
 * Vault dest handler: deposit the handler's `inputToken` into a vault on the dst chain.
 * fetchZapSteps may run via the dst-only recovery path when hookData oversizes.
 */
export class VaultDestHandler implements IDestHandler<VaultDestState> {
  readonly kind = 'vault' as const;

  constructor(private readonly destVaultId: VaultEntity['id']) {}

  async fetchQuote(
    inputAmount: BigNumber,
    ctx: DestHandlerContext
  ): Promise<DestHandlerQuote<VaultDestState>> {
    const destHelpers = await ctx.resolveHelpersForVault(this.destVaultId);
    const destStrategies = await (
      await getTransactApi()
    ).getInnerZapStrategiesForVault(destHelpers);

    const candidates = await VaultDestHandler.findDepositCandidates(destStrategies, ctx.inputToken);
    if (!candidates.length) {
      throw new Error(
        `[vault-dest] No composable destination strategy accepts input token on chain ${ctx.destChainId} for vault ${this.destVaultId}`
      );
    }

    const destQuote = await this.quoteBestCandidate(candidates, inputAmount, destHelpers, ctx);

    const dustTokens = collectIntermediateTokens({
      anchorToken: ctx.inputToken,
      picks: {
        outputs: destQuote.outputs,
        inputs: destQuote.inputs,
        returned: destQuote.returned,
      },
      swapSteps: destQuote.steps,
    });

    return {
      destSteps: destQuote.steps,
      outputs: destQuote.outputs,
      returned: destQuote.returned,
      dustTokens,
      allowances: destQuote.allowances.filter(a => a.amount.gt(BIG_ZERO)),
      state: { kind: 'vault', destQuote },
    };
  }

  async fetchZapSteps(
    quote: DestHandlerQuote<VaultDestState>,
    ctx: DestHandlerContext
  ): Promise<DestHandlerSteps> {
    const destHelpers = await ctx.resolveHelpersForVault(this.destVaultId);
    const destStrategies = await (
      await getTransactApi()
    ).getInnerZapStrategiesForVault(destHelpers);

    const { destQuote } = quote.state;
    const found = destStrategies.find(s => s.id === destQuote.strategyId);
    if (!found || !isComposableStrategy(found)) {
      throw new Error(
        `[vault-dest] Destination strategy '${destQuote.strategyId}' on chain ${ctx.destChainId} is not composable`
      );
    }
    const destStrategy = withBoost(found, destHelpers, ctx.boostId);

    await destStrategy.beforeStep?.();
    const breakdown = await destStrategy.fetchDepositUserlessZapBreakdown(destQuote);
    return {
      zapSteps: breakdown.zapRequest.steps,
      orderOutputs: breakdown.zapRequest.order.outputs,
      expectedTokens: breakdown.expectedTokens,
    };
  }

  // A strategy can offer several routes from the same token (e.g. pool swap vs aggregator); quote them all and keep the best
  private async quoteBestCandidate(
    candidates: StrategyCandidates[],
    inputAmount: BigNumber,
    destHelpers: ZapTransactHelpers,
    ctx: DestHandlerContext
  ): Promise<ZapDepositQuote> {
    const quoted: ZapDepositQuote[] = [];
    const failures: unknown[] = [];
    for (const { strategy, options } of candidates) {
      const wrapped: IStrategy = withBoost(strategy, destHelpers, ctx.boostId);
      await wrapped.beforeQuote?.();
      const results = await Promise.allSettled(
        options.map(async option => {
          const quote = await wrapped.fetchDepositQuote(
            [{ token: ctx.inputToken, amount: inputAmount, max: false }],
            option
          );
          if (!isZapQuote(quote)) {
            throw new Error(
              `[vault-dest] Composable strategy '${strategy.id}' returned a non-zap deposit quote`
            );
          }
          return quote;
        })
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          quoted.push(result.value);
        } else {
          console.warn(`[vault-dest] quote via '${strategy.id}' failed`, result.reason);
          failures.push(result.reason);
        }
      }
    }

    // All candidates deposit into the same vault, so outputs are denominated in the same share token
    const best = quoted.reduce<ZapDepositQuote | undefined>(
      (acc, q) => (acc && totalOutput(acc).gte(totalOutput(q)) ? acc : q),
      undefined
    );
    if (!best) {
      // prefer typed errors (e.g. CLM not calm / locked) so the UI shows its retry alert
      throw (
        failures.find(isSerializableError) ??
        new Error(
          `[vault-dest] No deposit route from input token could be quoted for vault ${this.destVaultId}`
        )
      );
    }
    return best;
  }

  /** Every composable dst strategy option accepting the input token; identity case is handled by SingleStrategy's identity option. */
  private static async findDepositCandidates(
    strategies: IStrategy[],
    inputToken: TokenErc20 | { address: string }
  ): Promise<StrategyCandidates[]> {
    const candidates: StrategyCandidates[] = [];
    for (const strategy of strategies) {
      if (!isComposableStrategy(strategy)) continue;
      try {
        const options = await strategy.fetchDepositOptions();
        const matched = options.filter(
          o =>
            o.inputs.length === 1 &&
            o.inputs[0].address.toLowerCase() === inputToken.address.toLowerCase()
        );
        if (matched.length) {
          candidates.push({ strategy, options: matched });
        }
      } catch (err) {
        console.warn(`[vault-dest] findDepositCandidates: strategy '${strategy.id}' failed`, err);
      }
    }

    return candidates;
  }
}

function totalOutput(quote: ZapDepositQuote): BigNumber {
  return quote.outputs.reduce((sum, o) => sum.plus(o.amount), BIG_ZERO);
}
