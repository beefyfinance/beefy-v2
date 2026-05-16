import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { isVaultWithReceipt, type VaultEntity } from '../../../../entities/vault.ts';
import { selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import { selectVaultById } from '../../../../selectors/vaults.ts';
import { selectWalletAddress } from '../../../../selectors/wallet.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import { getRoutingTokensForChain } from '../../../../../../config/vault-to-vault/routing-tokens.ts';
import { mergeTokenAmounts, slipBy } from '../../helpers/amounts.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
} from '../../helpers/options.ts';
import {
  calculatePriceImpact,
  convertVaultShareToDepositTokenAmount,
  highestFeeOrZero,
} from '../../helpers/quotes.ts';
import { NO_RELAY } from '../../helpers/zap.ts';
import { buildDustOutputs, mergeOutputs } from '../../handlers/dust.ts';
import { VaultSourceHandler } from '../../handlers/vault/VaultSourceHandler.ts';
import { VaultDestHandler } from '../../handlers/vault/VaultDestHandler.ts';
import type {
  DestHandlerContext,
  DestHandlerQuote,
  IDestHandler,
  ISourceHandler,
  SourceHandlerContext,
  SourceHandlerQuote,
} from '../../handlers/types.ts';
import {
  SelectionOrder,
  type AllowanceTokenAmount,
  type InputTokenAmount,
  type TokenAmount,
  type VaultToVaultSingleTokenDepositOption,
  type VaultToVaultSingleTokenDepositQuote,
  type VaultToVaultSingleTokenWithdrawOption,
  type VaultToVaultSingleTokenWithdrawQuote,
  type ZapFee,
  type ZapQuoteStep,
} from '../../transact-types.ts';
import type { UserlessZapRequest } from '../../zap/types.ts';
import {
  type IZapStrategy,
  type IZapStrategyStatic,
  type ZapTransactHelpers,
  isZapTransactHelpers,
} from '../IStrategy.ts';
import type { VaultToVaultSingleTokenStrategyConfig } from '../strategy-configs.ts';
import { getTransactApi } from '../../../instances.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import { enumerateSameChainDstCandidates, enumerateSameChainSrcCandidates } from './enumeration.ts';

const strategyId = 'vault-to-vault-single-token';
type StrategyId = typeof strategyId;

type V2VQuoteBody = {
  sourceSteps: ZapQuoteStep[];
  destSteps: ZapQuoteStep[];
  trailingSteps: ZapQuoteStep[];
  outputs: TokenAmount[];
  returned: TokenAmount[];
  allowances: AllowanceTokenAmount[];
  priceImpact: number;
  fee: ZapFee;
  srcHandlerQuote: SourceHandlerQuote;
  destHandlerQuote: DestHandlerQuote;
};

class VaultToVaultSingleTokenStrategyImpl implements IZapStrategy<StrategyId> {
  public static readonly id = strategyId;
  public readonly id = strategyId;

  constructor(
    protected options: VaultToVaultSingleTokenStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {}

  // --- CONTEXT FACTORIES ---

  private makeSourceContext(routingToken: TokenEntity): SourceHandlerContext {
    return {
      helpers: this.helpers,
      sourceChainId: this.helpers.vault.chainId,
      outputToken: routingToken,
      slippage: selectTransactSlippage(this.helpers.getState()),
      pageVaultId: this.helpers.vault.id,
      resolveHelpersForVault: vaultId => this.resolveHelpersForVault(vaultId),
    };
  }

  private makeDestContext(routingToken: TokenEntity): DestHandlerContext {
    return {
      helpers: this.helpers,
      destChainId: this.helpers.vault.chainId,
      inputToken: routingToken,
      slippage: selectTransactSlippage(this.helpers.getState()),
      pageVaultId: this.helpers.vault.id,
      resolveHelpersForVault: vaultId => this.resolveHelpersForVault(vaultId),
    };
  }

  private async resolveHelpersForVault(vaultId: VaultEntity['id']): Promise<ZapTransactHelpers> {
    const helpers = await (
      await getTransactApi()
    ).getHelpersForVault(vaultId, this.helpers.getState);
    if (!isZapTransactHelpers(helpers)) {
      throw new Error(`Vault ${vaultId} has no zap helpers configured`);
    }
    return helpers;
  }

  // --- OPTIONS ---

  async fetchDepositOptions(): Promise<VaultToVaultSingleTokenDepositOption[]> {
    const { vault, getState } = this.helpers;
    const state = getState();
    const walletAddress = selectWalletAddress(state);
    if (!walletAddress) return [];

    const routingTokens = getRoutingTokensForChain(vault.chainId, state);
    if (!routingTokens.length) return [];

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const results: VaultToVaultSingleTokenDepositOption[] = [];

    for (const routingToken of routingTokens) {
      const candidates = await enumerateSameChainSrcCandidates(
        vault.id,
        state,
        walletAddress,
        routingToken
      );
      for (const candidate of candidates) {
        const srcVault = selectVaultById(state, candidate.vaultId);
        if (!srcVault || !('contractAddress' in srcVault)) continue;
        const shareToken = selectTokenByAddress(state, candidate.chainId, srcVault.contractAddress);
        const selectionId = createSelectionId(
          candidate.chainId,
          [shareToken],
          `v2v:${candidate.vaultId}:${routingToken.address.toLowerCase()}`
        );
        results.push({
          id: createOptionId(strategyId, vault.id, selectionId, candidate.vaultId),
          strategyId,
          mode: TransactMode.Deposit,
          vaultId: vault.id,
          chainId: vault.chainId,
          selectionId,
          selectionOrder: SelectionOrder.VaultToVault,
          selectionHideIfZeroBalance: true,
          inputs: [shareToken],
          wantedOutputs: [depositToken],
          srcVaultId: candidate.vaultId,
          destVaultId: vault.id,
          routingToken,
        });
      }
    }
    return results;
  }

  async fetchWithdrawOptions(): Promise<VaultToVaultSingleTokenWithdrawOption[]> {
    // if (true) return []; // --- withdrawals are disabled for the time being
    const { vault, getState } = this.helpers;
    const state = getState();
    const routingTokens = getRoutingTokensForChain(vault.chainId, state);
    if (!routingTokens.length) return [];
    if (!isVaultWithReceipt(vault)) return [];

    const shareToken = selectTokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
    const results: VaultToVaultSingleTokenWithdrawOption[] = [];

    for (const routingToken of routingTokens) {
      const candidates = await enumerateSameChainDstCandidates(vault.id, state, routingToken);
      for (const candidate of candidates) {
        const destVault = selectVaultById(state, candidate.vaultId);
        if (!destVault || !('contractAddress' in destVault)) continue;
        const destShareToken = selectTokenByAddress(
          state,
          candidate.chainId,
          destVault.contractAddress
        );
        const selectionId = createSelectionId(
          candidate.chainId,
          [destShareToken],
          `v2v-withdraw:${candidate.vaultId}:${routingToken.address.toLowerCase()}`
        );
        results.push({
          id: createOptionId(strategyId, vault.id, selectionId, candidate.vaultId),
          strategyId,
          mode: TransactMode.Withdraw,
          vaultId: vault.id,
          chainId: vault.chainId,
          selectionId,
          selectionOrder: SelectionOrder.VaultToVault,
          inputs: [shareToken],
          wantedOutputs: [destShareToken],
          srcVaultId: vault.id,
          destVaultId: candidate.vaultId,
          routingToken,
        });
      }
    }
    return results;
  }

  // --- DIRECTION-AGNOSTIC CORE ---

  private async quoteVaultToVault(
    input: InputTokenAmount,
    option: VaultToVaultSingleTokenDepositOption | VaultToVaultSingleTokenWithdrawOption
  ): Promise<V2VQuoteBody> {
    const state = this.helpers.getState();
    const slippage = selectTransactSlippage(state);
    const { routingToken } = option;

    const srcCtx = this.makeSourceContext(routingToken);
    const destCtx = this.makeDestContext(routingToken);

    const srcHandler = new VaultSourceHandler(option.srcVaultId);
    const destHandler = new VaultDestHandler(option.destVaultId);

    const srcHandlerQuote = await srcHandler.fetchQuote(input, srcCtx);

    const inputAmount =
      srcHandlerQuote.slippageAppliesToOutput ?
        slipBy(srcHandlerQuote.outputAmount, slippage, routingToken.decimals)
      : srcHandlerQuote.outputAmount;

    const destHandlerQuote = await destHandler.fetchQuote(inputAmount, destCtx);

    const sourceSteps = srcHandlerQuote.sourceSteps.filter(s => s.type !== 'unused');
    const destSteps = destHandlerQuote.destSteps.filter(s => s.type !== 'unused');
    const returned = mergeTokenAmounts(srcHandlerQuote.returned, destHandlerQuote.returned);
    const trailingSteps: ZapQuoteStep[] =
      returned.length > 0 ? [{ type: 'unused', outputs: returned }] : [];

    const inputForPricing = convertVaultShareToDepositTokenAmount(
      state,
      option.srcVaultId,
      input.amount
    );

    return {
      sourceSteps,
      destSteps,
      trailingSteps,
      outputs: destHandlerQuote.outputs,
      returned,
      allowances: srcHandlerQuote.allowances,
      priceImpact: calculatePriceImpact(
        [inputForPricing],
        destHandlerQuote.outputs,
        returned,
        state
      ),
      fee: highestFeeOrZero([...sourceSteps, ...destSteps]),
      srcHandlerQuote,
      destHandlerQuote,
    };
  }

  private async stepVaultToVault(
    quote: VaultToVaultSingleTokenDepositQuote | VaultToVaultSingleTokenWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const { routingToken } = quote.option;

    const srcCtx = this.makeSourceContext(routingToken);
    const destCtx = this.makeDestContext(routingToken);

    const srcHandler: ISourceHandler = new VaultSourceHandler(quote.option.srcVaultId);
    const destHandler: IDestHandler = new VaultDestHandler(quote.option.destVaultId);

    const srcSteps = await srcHandler.fetchZapSteps(quote.srcHandlerQuote, srcCtx);
    const destSteps = await destHandler.fetchZapSteps(quote.destHandlerQuote, destCtx);

    const srcDust = buildDustOutputs(quote.srcHandlerQuote.dustTokens);
    const destDust = buildDustOutputs(quote.destHandlerQuote.dustTokens);
    const orderOutputs = mergeOutputs(destSteps.orderOutputs, mergeOutputs(srcDust, destDust));

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs: srcSteps.orderInputs,
        outputs: orderOutputs,
        relay: NO_RELAY,
      },
      steps: [...srcSteps.zapSteps, ...destSteps.zapSteps],
    };

    const isDeposit = quote.option.mode === TransactMode.Deposit;
    return {
      step: isDeposit ? 'zap-in' : 'zap-out',
      message: t('Vault-TxnConfirm', {
        type: t(isDeposit ? 'Deposit-noun' : 'Withdraw-noun'),
      }),
      action: zapExecuteOrder(this.helpers.vault.id, zapRequest, destSteps.expectedTokens),
      pending: false,
      extraInfo: { zap: true, vaultId: this.helpers.vault.id },
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: VaultToVaultSingleTokenDepositOption
  ): Promise<VaultToVaultSingleTokenDepositQuote> {
    const body = await this.quoteVaultToVault(onlyOneInput(inputs), option);
    return {
      id: createQuoteId(option.id),
      strategyId,
      option,
      inputs,
      ...body,
      steps: [...body.sourceSteps, ...body.destSteps, ...body.trailingSteps],
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: VaultToVaultSingleTokenWithdrawOption
  ): Promise<VaultToVaultSingleTokenWithdrawQuote> {
    const body = await this.quoteVaultToVault(onlyOneInput(inputs), option);
    return {
      id: createQuoteId(option.id),
      strategyId,
      option,
      inputs,
      ...body,
      steps: [...body.sourceSteps, ...body.destSteps, ...body.trailingSteps],
    };
  }

  async fetchDepositStep(
    quote: VaultToVaultSingleTokenDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    return this.stepVaultToVault(quote, t);
  }

  async fetchWithdrawStep(
    quote: VaultToVaultSingleTokenWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    return this.stepVaultToVault(quote, t);
  }
}

export const VaultToVaultSingleTokenStrategy =
  VaultToVaultSingleTokenStrategyImpl satisfies IZapStrategyStatic<StrategyId>;
