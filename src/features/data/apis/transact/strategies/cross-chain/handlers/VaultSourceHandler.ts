import { BIG_ZERO, fromWei, toWei } from '../../../../../../../helpers/big-number.ts';
import { isTokenEqual, type TokenErc20 } from '../../../../../entities/token.ts';
import type { VaultEntity } from '../../../../../entities/vault.ts';
import { selectVaultPricePerFullShare } from '../../../../../selectors/vaults.ts';
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
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
  SourceHandlerSteps,
} from './types.ts';

type StrategyMatch = { strategy: IStrategy; option: WithdrawOption };

/** Strategy is re-resolved at step time (via underlyingQuote.strategyId) to avoid stale state across RPC calls. */
type VaultSourceState = {
  underlyingQuote: ZapWithdrawQuote;
};

/**
 * Vault source handler: withdraw vault shares to bridge token on the src chain.
 * `slippageAppliesToBridge` is hard-coded true — vault withdraws always slip.
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

    const match = await VaultSourceHandler.findStrategyForBridgeTokenWithdraw(
      strategies,
      ctx.bridgeToken
    );
    if (!match) {
      throw new Error(
        `[cross-chain/vault-source] No composable vault strategy can withdraw to bridge token on chain ${ctx.sourceChainId} for vault ${this.srcVaultId}`
      );
    }

    /** Adapt share-token input to the strategy's declared input token */
    const expectedToken = match.option.inputs[0];
    const adaptedInput: InputTokenAmount =
      isTokenEqual(expectedToken, input.token) ? input : (
        {
          token: expectedToken,
          amount: fromWei(
            toWei(input.amount, input.token.decimals).multipliedBy(
              selectVaultPricePerFullShare(srcHelpers.getState(), this.srcVaultId)
            ),
            expectedToken.decimals
          ),
          max: input.max,
        }
      );

    const underlyingQuote = await match.strategy.fetchWithdrawQuote([adaptedInput], match.option);
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

    const dustTokens = collectIntermediateTokens({
      bridgeToken: ctx.bridgeToken,
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
      bridgeTokenOut: bridgeTokenOutput.amount,
      allowances: underlyingQuote.allowances,
      returned: underlyingQuote.returned,
      dustTokens,
      slippageAppliesToBridge: true,
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
        `[cross-chain/vault-source] Source withdraw strategy '${underlyingQuote.strategyId}' on chain ${ctx.sourceChainId} is not composable`
      );
    }

    const breakdown = await strategy.fetchWithdrawUserlessZapBreakdown(underlyingQuote);

    return {
      zapSteps: breakdown.zapRequest.steps,
      orderInputs: breakdown.zapRequest.order.inputs,
      orderOutputs: breakdown.zapRequest.order.outputs,
    };
  }

  /** Find a composable src strategy whose withdraw produces the bridge token; identity case is handled by SingleStrategy's identity option. */
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
