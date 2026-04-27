import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import type { TokenErc20 } from '../../../../../entities/token.ts';
import type { VaultEntity } from '../../../../../entities/vault.ts';
import { getTransactApi } from '../../../../instances.ts';
import { isZapQuote, type DepositOption, type ZapDepositQuote } from '../../../transact-types.ts';
import { isComposableStrategy, type IStrategy } from '../../IStrategy.ts';
import { collectIntermediateTokens } from './dust.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
} from './types.ts';

/**
 * Matches the private `{ strategy, option }` return shape of the strategy-
 * resolution helper used by both fetch-quote and recovery flows.
 */
type StrategyMatch = { strategy: IStrategy; option: DepositOption };

/**
 * State preserved between `fetchQuote` and `fetchZapSteps`.
 * `strategyId` is re-resolved against dst helpers at reconstruction time so
 * no stale strategy instance is held across RPC calls.
 */
type VaultDestState = {
  destQuote: ZapDepositQuote;
  strategyId: IStrategy['id'];
};

/**
 * Destination handler for the "deposit into a vault on the dst chain" flow.
 * Services three callers (via the same two methods):
 * - Today's deposit path (dst vault = page vault).
 * - Phase 2 Path C: cross-chain withdraw whose dst is a vault
 *   (dst vault != page vault).
 * - The dst-only recovery path when hookData overflows; the orchestrator
 *   re-invokes `fetchZapSteps` via `CrossChainStrategy.fetchRecoveryStep`
 *   to produce the "complete deposit" step. `fetchQuote` is skipped — the
 *   handler quote captured at recovery-quote time is reused.
 *
 * Resolves dst helpers via `ctx.resolveHelpersForVault` so the handler works
 * for the page vault (today) or an arbitrary dst vault (Phase 2+ Path C).
 */
export class VaultDestHandler implements IDestHandler<VaultDestState> {
  readonly kind = 'vault' as const;

  constructor(private readonly destVaultId: VaultEntity['id']) {}

  async fetchQuote(
    bridgeTokenIn: BigNumber,
    ctx: DestHandlerContext
  ): Promise<DestHandlerQuote<VaultDestState>> {
    const destHelpers = await ctx.resolveHelpersForVault(this.destVaultId);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);

    const match = await VaultDestHandler.findStrategyForBridgeTokenDeposit(
      destStrategies,
      ctx.destBridgeToken
    );
    if (!match) {
      throw new Error(
        `[cross-chain/vault-dest] No composable destination strategy accepts bridge token on chain ${ctx.destChainId} for vault ${this.destVaultId}`
      );
    }

    const destQuote = await match.strategy.fetchDepositQuote(
      [{ token: ctx.destBridgeToken, amount: bridgeTokenIn, max: false }],
      match.option
    );
    if (!isZapQuote(destQuote)) {
      throw new Error(
        `[cross-chain/vault-dest] Composable strategy '${match.strategy.id}' returned a non-zap deposit quote`
      );
    }

    const dustTokens = collectIntermediateTokens({
      context: 'deposit-dest',
      pickTokensFrom: {
        outputs: destQuote.outputs,
        inputs: destQuote.inputs,
        returned: destQuote.returned,
      },
      bridgeToken: ctx.destBridgeToken,
      swapSteps: destQuote.steps,
    });

    return {
      destSteps: destQuote.steps,
      outputs: destQuote.outputs,
      returned: destQuote.returned,
      dustTokens,
      allowances: destQuote.allowances.filter(a => a.amount.gt(BIG_ZERO)),
      state: { destQuote, strategyId: match.strategy.id },
    };
  }

  async fetchZapSteps(
    quote: DestHandlerQuote<VaultDestState>,
    ctx: DestHandlerContext
  ): Promise<DestHandlerSteps> {
    const destHelpers = await ctx.resolveHelpersForVault(this.destVaultId);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);

    const destStrategy = destStrategies.find(s => s.id === quote.state.strategyId);
    if (!destStrategy || !isComposableStrategy(destStrategy)) {
      throw new Error(
        `[cross-chain/vault-dest] Destination strategy '${quote.state.strategyId}' on chain ${ctx.destChainId} is not composable`
      );
    }

    const breakdown = await destStrategy.fetchDepositUserlessZapBreakdown(
      quote.state.destQuote as Parameters<typeof destStrategy.fetchDepositUserlessZapBreakdown>[0]
    );
    return {
      zapSteps: breakdown.zapRequest.steps,
      orderOutputs: breakdown.zapRequest.order.outputs,
      expectedTokens: breakdown.expectedTokens,
    };
  }

  /**
   * Find a composable strategy on the dst vault that accepts the bridge
   * token as a deposit input. The identity case (depositToken == bridgeToken)
   * is handled by SingleStrategy emitting an identity option, which the loop
   * discovers naturally.
   */
  private static async findStrategyForBridgeTokenDeposit(
    strategies: IStrategy[],
    destBridgeToken: TokenErc20 | { address: string }
  ): Promise<StrategyMatch | undefined> {
    for (const strategy of strategies) {
      if (!isComposableStrategy(strategy)) continue;
      try {
        const options = await strategy.fetchDepositOptions();
        const bridgeTokenOption = options.find(
          o =>
            o.inputs.length === 1 &&
            o.inputs[0].address.toLowerCase() === destBridgeToken.address.toLowerCase()
        );
        if (bridgeTokenOption) {
          return { strategy, option: bridgeTokenOption };
        }
      } catch (err) {
        console.warn(
          `[cross-chain] findStrategyForBridgeTokenDeposit: strategy '${strategy.id}' failed`,
          err
        );
      }
    }

    return undefined;
  }
}
