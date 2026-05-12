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

type StrategyMatch = { strategy: IStrategy; option: DepositOption };

/** Strategy is re-resolved at step time (via destQuote.strategyId) to avoid stale state across RPC calls. */
type VaultDestState = {
  destQuote: ZapDepositQuote;
};

/**
 * Vault dest handler: deposit bridge token into a vault on the dst chain.
 * fetchZapSteps may run via the dst-only recovery path when hookData oversizes.
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
      bridgeToken: ctx.destBridgeToken,
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
      state: { destQuote },
    };
  }

  async fetchZapSteps(
    quote: DestHandlerQuote<VaultDestState>,
    ctx: DestHandlerContext
  ): Promise<DestHandlerSteps> {
    const destHelpers = await ctx.resolveHelpersForVault(this.destVaultId);
    const destStrategies = await (await getTransactApi()).getZapStrategiesForVault(destHelpers);

    const { destQuote } = quote.state;
    const destStrategy = destStrategies.find(s => s.id === destQuote.strategyId);
    if (!destStrategy || !isComposableStrategy(destStrategy)) {
      throw new Error(
        `[cross-chain/vault-dest] Destination strategy '${destQuote.strategyId}' on chain ${ctx.destChainId} is not composable`
      );
    }

    const breakdown = await destStrategy.fetchDepositUserlessZapBreakdown(destQuote);
    return {
      zapSteps: breakdown.zapRequest.steps,
      orderOutputs: breakdown.zapRequest.order.outputs,
      expectedTokens: breakdown.expectedTokens,
    };
  }

  /** Find a composable dst strategy accepting the bridge token; identity case is handled by SingleStrategy's identity option. */
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
