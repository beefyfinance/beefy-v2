import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import type { TokenErc20 } from '../../../../../entities/token.ts';
import type { VaultEntity } from '../../../../../entities/vault.ts';
import { getTransactApi } from '../../../../instances.ts';
import {
  isZapQuote,
  type InputTokenAmount,
  type WithdrawOption,
  type ZapWithdrawQuote,
} from '../../../transact-types.ts';
import { isComposableStrategy, type IStrategy } from '../../IStrategy.ts';
import { collectIntermediateTokens } from './dust.ts';
import type {
  HandlerContext,
  ISourceHandler,
  SourceHandlerQuote,
  SourceHandlerSteps,
} from './types.ts';

/**
 * Match shape returned by the strategy-resolution helper; mirrors the
 * private `{ strategy, option }` type used across the orchestrator.
 */
type StrategyMatch = { strategy: IStrategy; option: WithdrawOption };

/**
 * State preserved between `fetchQuote` and `fetchZapSteps`. The underlying
 * strategy is identified by id so the handler can re-resolve the instance
 * against fresh dst helpers at step time (mirrors the current orchestrator's
 * re-resolve-at-step-time pattern).
 */
type VaultSourceState = {
  underlyingQuote: ZapWithdrawQuote;
  strategyId: IStrategy['id'];
};

/**
 * Source handler for the "withdraw vault shares → bridge-token" flow on the
 * src chain. Services two callers:
 * - Today's withdraw path (src vault = page vault).
 * - Phase 2 vault-to-vault deposit (src vault is arbitrary).
 *
 * Vault withdraws always produce some slippage (decimals/accounting), so
 * `slippageAppliesToBridge` is hard-coded to `true`.
 */
export class VaultSourceHandler implements ISourceHandler<VaultSourceState> {
  readonly kind = 'vault' as const;

  constructor(private readonly srcVaultId: VaultEntity['id']) {}

  async fetchQuote(
    input: InputTokenAmount,
    ctx: HandlerContext
  ): Promise<SourceHandlerQuote<VaultSourceState>> {
    const srcHelpers = await ctx.resolveHelpersForVault(this.srcVaultId);
    const strategies = await (await getTransactApi()).getZapStrategiesForVault(srcHelpers);

    const match = await VaultSourceHandler.findStrategyForBridgeTokenWithdraw(
      strategies,
      ctx.bridgeToken
    );
    if (!match) {
      throw new Error(
        `[cross-chain/vault-source] No composable vault strategy can withdraw to bridge token on chain ${ctx.sourceChainId} for vault ${this.srcVaultId}`
      );
    }

    const underlyingQuote = await match.strategy.fetchWithdrawQuote([input], match.option);
    if (!isZapQuote(underlyingQuote)) {
      throw new Error(
        `[cross-chain/vault-source] Composable strategy '${match.strategy.id}' returned a non-zap withdraw quote`
      );
    }

    const bridgeTokenOutput = underlyingQuote.outputs.find(
      o => o.token.address.toLowerCase() === ctx.bridgeToken.address.toLowerCase()
    );
    if (!bridgeTokenOutput || bridgeTokenOutput.amount.lte(BIG_ZERO)) {
      throw new Error('Withdrawal did not produce bridge token');
    }

    // Dust token contributions for the source (withdraw-source) context.
    // Orchestrator owns the bridge-token contribution separately.
    const dustTokens = collectIntermediateTokens({
      context: 'withdraw-source',
      inputs: [input],
      bridgeToken: ctx.bridgeToken,
      withdrawQuote: {
        outputs: underlyingQuote.outputs,
        inputs: underlyingQuote.inputs,
        returned: underlyingQuote.returned,
        steps: underlyingQuote.steps,
      },
    });

    return {
      sourceSteps: [...underlyingQuote.steps],
      bridgeTokenOut: bridgeTokenOutput.amount,
      allowances: underlyingQuote.allowances,
      returned: underlyingQuote.returned,
      dustTokens,
      slippageAppliesToBridge: true,
      state: { underlyingQuote, strategyId: match.strategy.id },
    };
  }

  async fetchZapSteps(
    quote: SourceHandlerQuote<VaultSourceState>,
    ctx: HandlerContext
  ): Promise<SourceHandlerSteps> {
    const srcHelpers = await ctx.resolveHelpersForVault(this.srcVaultId);
    const strategies = await (await getTransactApi()).getZapStrategiesForVault(srcHelpers);

    const strategy = strategies.find(s => s.id === quote.state.strategyId);
    if (!strategy || !isComposableStrategy(strategy)) {
      throw new Error(
        `[cross-chain/vault-source] Source withdraw strategy '${quote.state.strategyId}' on chain ${ctx.sourceChainId} is not composable`
      );
    }

    const breakdown = await strategy.fetchWithdrawUserlessZapBreakdown(
      quote.state.underlyingQuote as Parameters<
        typeof strategy.fetchWithdrawUserlessZapBreakdown
      >[0]
    );

    return {
      zapSteps: breakdown.zapRequest.steps,
      orderInputs: breakdown.zapRequest.order.inputs,
      orderOutputs: breakdown.zapRequest.order.outputs,
    };
  }

  /**
   * Find a composable strategy on the src vault whose withdraw produces the
   * bridge token. The identity case (depositToken == bridgeToken) is handled
   * by SingleStrategy emitting an identity option, which the loop discovers
   * naturally.
   */
  private static async findStrategyForBridgeTokenWithdraw(
    strategies: IStrategy[],
    sourceBridgeToken: TokenErc20 | { address: string }
  ): Promise<StrategyMatch | undefined> {
    for (const strategy of strategies) {
      if (!isComposableStrategy(strategy)) continue;
      try {
        const options = await strategy.fetchWithdrawOptions();
        const bridgeTokenOption = options.find(
          o =>
            o.wantedOutputs.length === 1 &&
            o.wantedOutputs[0].address.toLowerCase() === sourceBridgeToken.address.toLowerCase()
        );
        if (bridgeTokenOption) {
          return { strategy, option: bridgeTokenOption };
        }
      } catch (err) {
        console.warn(
          `[cross-chain] findStrategyForBridgeTokenWithdraw: strategy '${strategy.id}' failed`,
          err
        );
      }
    }

    return undefined;
  }
}
