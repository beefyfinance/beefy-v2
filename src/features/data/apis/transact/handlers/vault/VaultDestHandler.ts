import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import type { TokenErc20 } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { getTransactApi } from '../../../instances.ts';
import { isZapQuote, type DepositOption } from '../../transact-types.ts';
import {
  isComposableStrategy,
  type IStrategy,
  type ZapTransactHelpers,
} from '../../strategies/IStrategy.ts';
import { StakeIntoBoostZapStrategy } from '../../strategies/StakeIntoBoostStrategy.ts';
import { findBoostStakeStep } from '../../helpers/boost.ts';
import { selectBoostById, selectBoostByIdOrUndefined } from '../../../../selectors/boosts.ts';
import { selectTransactStakeIntoBoostTarget } from '../../../../selectors/transact.ts';
import { collectIntermediateTokens } from '../dust.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  DestHandlerSteps,
  IDestHandler,
  VaultDestState,
} from '../types.ts';

type StrategyMatch = { strategy: IStrategy; option: DepositOption };

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

    const match = await VaultDestHandler.findStrategyForInputDeposit(
      destStrategies,
      ctx.inputToken
    );
    if (!match) {
      throw new Error(
        `[vault-dest] No composable destination strategy accepts input token on chain ${ctx.destChainId} for vault ${this.destVaultId}`
      );
    }

    const strategy = this.maybeStakeIntoBoost(match.strategy, destHelpers, ctx);
    await strategy.beforeQuote?.();
    const destQuote = await strategy.fetchDepositQuote(
      [{ token: ctx.inputToken, amount: inputAmount, max: false }],
      match.option
    );
    if (!isZapQuote(destQuote)) {
      throw new Error(
        `[vault-dest] Composable strategy '${match.strategy.id}' returned a non-zap deposit quote`
      );
    }

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
    const destStrategy = destStrategies.find(s => s.id === destQuote.strategyId);
    if (!destStrategy || !isComposableStrategy(destStrategy)) {
      throw new Error(
        `[vault-dest] Destination strategy '${destQuote.strategyId}' on chain ${ctx.destChainId} is not composable`
      );
    }

    // keyed off the quote, not live state, so the executed route always matches the quoted one
    const stakeStep = findBoostStakeStep(destQuote.steps);
    const strategy =
      stakeStep ?
        new StakeIntoBoostZapStrategy(
          destStrategy,
          destHelpers,
          selectBoostById(destHelpers.getState(), stakeStep.boostId)
        )
      : destStrategy;

    await strategy.beforeStep?.();
    const breakdown = await strategy.fetchDepositUserlessZapBreakdown(destQuote);
    return {
      zapSteps: breakdown.zapRequest.steps,
      orderOutputs: breakdown.zapRequest.order.outputs,
      expectedTokens: breakdown.expectedTokens,
    };
  }

  /**
   * Cross-chain / vault-to-vault run their dst leg on inner strategies, which `getStrategyById`
   * never sees — so the boost decorator has to be applied here instead.
   *
   * On recovery the live form no longer describes the op being completed, so the intent recorded
   * on the op wins; the live toggle is only consulted when quoting a fresh deposit.
   */
  private maybeStakeIntoBoost(
    strategy: IStrategy,
    destHelpers: ZapTransactHelpers,
    ctx: DestHandlerContext
  ): IStrategy {
    if (!isComposableStrategy(strategy)) {
      return strategy;
    }

    const state = destHelpers.getState();
    const boost =
      ctx.stakeIntoBoostId ?
        selectBoostByIdOrUndefined(state, destHelpers.vault.chainId, ctx.stakeIntoBoostId)
      : ctx.isRecovery ? undefined
      : selectTransactStakeIntoBoostTarget(state);

    if (!boost || boost.vaultId !== this.destVaultId) {
      return strategy;
    }
    return new StakeIntoBoostZapStrategy(strategy, destHelpers, boost);
  }

  /** Find a composable dst strategy accepting the input token; identity case is handled by SingleStrategy's identity option. */
  private static async findStrategyForInputDeposit(
    strategies: IStrategy[],
    inputToken: TokenErc20 | { address: string }
  ): Promise<StrategyMatch | undefined> {
    for (const strategy of strategies) {
      if (!isComposableStrategy(strategy)) continue;
      try {
        const options = await strategy.fetchDepositOptions();
        const matched = options.find(
          o =>
            o.inputs.length === 1 &&
            o.inputs[0].address.toLowerCase() === inputToken.address.toLowerCase()
        );
        if (matched) {
          return { strategy, option: matched };
        }
      } catch (err) {
        console.warn(
          `[vault-dest] findStrategyForInputDeposit: strategy '${strategy.id}' failed`,
          err
        );
      }
    }

    return undefined;
  }
}
