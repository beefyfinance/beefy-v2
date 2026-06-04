import type { Namespace, TFunction } from 'react-i18next';
import { toWeiString } from '../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../actions/wallet/zap.ts';
import { isTokenEqual, type TokenEntity } from '../../../entities/token.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { selectTransactSlippage } from '../../../selectors/transact.ts';
import type { BeefyThunk } from '../../../store/types.ts';
import {
  applyWithdrawFeeToOrder,
  feeZapStepsFromQuoteStep,
  optionFeeEndpoints,
  resolveZapFee,
} from '../helpers/fee.ts';
import { isOptionFeeable } from '../helpers/options.ts';
import { calculatePriceImpact } from '../helpers/quotes.ts';
import { getTokenAddress } from '../helpers/zap.ts';
import {
  type InputTokenAmount,
  isZapQuoteStepFee,
  type ZapStrategyIdToDepositOption,
  type ZapStrategyIdToDepositQuote,
  type ZapStrategyIdToWithdrawOption,
  type ZapStrategyIdToWithdrawQuote,
} from '../transact-types.ts';
import type {
  IComposableStrategy,
  TransactHelpers,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from './IStrategy.ts';
import type { ZapStrategyId } from './strategy-configs.ts';

export class ChargeFeeStrategy<
  TId extends ZapStrategyId = ZapStrategyId,
> implements IComposableStrategy<TId> {
  public readonly id: TId;

  constructor(
    protected inner: IComposableStrategy<TId>,
    protected helpers: ZapTransactHelpers
  ) {
    this.id = inner.id;
  }

  get disableVaultDeposit() {
    return this.inner.disableVaultDeposit;
  }

  get disableVaultWithdraw() {
    return this.inner.disableVaultWithdraw;
  }

  beforeQuote(): Promise<void> {
    return this.inner.beforeQuote?.() ?? Promise.resolve();
  }

  beforeStep(): Promise<void> {
    return this.inner.beforeStep?.() ?? Promise.resolve();
  }

  getHelpers(): TransactHelpers {
    return this.inner.getHelpers();
  }

  fetchDepositOptions() {
    return this.inner.fetchDepositOptions();
  }

  fetchWithdrawOptions() {
    return this.inner.fetchWithdrawOptions();
  }

  canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean> {
    return this.inner.canAcceptTokenAsDeposit(token);
  }

  canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean> {
    return this.inner.canEmitTokenAsWithdraw(token);
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToDepositOption<TId>
  ): Promise<ZapStrategyIdToDepositQuote<TId>> {
    const state = this.helpers.getState();
    const ctx =
      isOptionFeeable(option) && inputs.length === 1 ? optionFeeEndpoints(option) : undefined;
    const resolved = ctx ? resolveZapFee(state, ctx, inputs[0].token, inputs[0].amount) : undefined;
    const netInput = resolved?.step?.netAmount ?? inputs[0].amount;
    const innerQuote = await this.inner.fetchDepositQuote(
      resolved ? [{ ...inputs[0], amount: netInput }] : inputs,
      option
    );
    if (!resolved) {
      return innerQuote;
    }

    return {
      ...innerQuote,
      inputs,
      // Approval must cover the gross input the router pulls, not the net the inner was quoted on.
      allowances: innerQuote.allowances.map(allowance => ({
        ...allowance,
        amount: inputs[0].amount,
      })),
      steps: resolved.step ? [resolved.step, ...innerQuote.steps] : innerQuote.steps,
      fee: resolved.display,
      priceImpact: calculatePriceImpact(inputs, innerQuote.outputs, innerQuote.returned, state),
    } as ZapStrategyIdToDepositQuote<TId>;
  }

  async fetchDepositUserlessZapBreakdown(
    quote: ZapStrategyIdToDepositQuote<TId>
  ): Promise<UserlessZapDepositBreakdown> {
    const state = this.helpers.getState();
    const feeStep = quote.steps.find(isZapQuoteStepFee);
    if (!feeStep) {
      return this.inner.fetchDepositUserlessZapBreakdown(quote);
    }

    const innerQuote = {
      ...quote,
      inputs: quote.inputs.map(input =>
        isTokenEqual(input.token, feeStep.token) ? { ...input, amount: feeStep.netAmount } : input
      ),
      steps: quote.steps.filter(step => !isZapQuoteStepFee(step)),
    } as ZapStrategyIdToDepositQuote<TId>;

    const breakdown = await this.inner.fetchDepositUserlessZapBreakdown(innerQuote);
    // Prepend the fee transfer and declare gross order inputs; the router holds net after the skim.
    const { zaps } = feeZapStepsFromQuoteStep(feeStep, state);
    breakdown.zapRequest.steps.unshift(...zaps);
    breakdown.zapRequest.order.inputs = quote.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));
    return breakdown;
  }

  async fetchDepositStep(
    quote: ZapStrategyIdToDepositQuote<TId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.fetchDepositUserlessZapBreakdown(quote);
      const walletAction = zapExecuteOrder(quote.option.vaultId, zapRequest, expectedTokens);
      return walletAction(dispatch, getState, extraArgument);
    };

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToWithdrawOption<TId>
  ): Promise<ZapStrategyIdToWithdrawQuote<TId>> {
    const state = this.helpers.getState();
    const innerQuote = await this.inner.fetchWithdrawQuote(inputs, option);
    const feeable = isOptionFeeable(option) && innerQuote.outputs.length === 1;
    const ctx = feeable ? optionFeeEndpoints(option) : undefined;
    const resolved =
      ctx ?
        resolveZapFee(state, ctx, innerQuote.outputs[0].token, innerQuote.outputs[0].amount)
      : undefined;
    if (!resolved) {
      return innerQuote;
    }

    const netOutputs = [
      {
        token: innerQuote.outputs[0].token,
        amount: resolved.step?.netAmount ?? innerQuote.outputs[0].amount,
      },
    ];
    return {
      ...innerQuote,
      outputs: netOutputs,
      steps: resolved.step ? [...innerQuote.steps, resolved.step] : innerQuote.steps,
      fee: resolved.display,
      priceImpact: calculatePriceImpact(innerQuote.inputs, netOutputs, innerQuote.returned, state),
    } as ZapStrategyIdToWithdrawQuote<TId>;
  }

  async fetchWithdrawUserlessZapBreakdown(
    quote: ZapStrategyIdToWithdrawQuote<TId>
  ): Promise<UserlessZapWithdrawBreakdown> {
    const state = this.helpers.getState();
    const slippage = selectTransactSlippage(state);
    const feeStep = quote.steps.find(isZapQuoteStepFee);
    if (!feeStep) {
      return this.inner.fetchWithdrawUserlessZapBreakdown(quote);
    }

    // Reconstruct the inner (gross-output, fee-free) quote so it floors the wanted token at slipBy(gross).
    const innerQuote = {
      ...quote,
      outputs: [{ token: feeStep.token, amount: feeStep.grossAmount }],
      steps: quote.steps.filter(step => !isZapQuoteStepFee(step)),
    } as ZapStrategyIdToWithdrawQuote<TId>;

    const breakdown = await this.inner.fetchWithdrawUserlessZapBreakdown(innerQuote);
    applyWithdrawFeeToOrder(
      breakdown.zapRequest.order,
      breakdown.zapRequest.steps,
      feeStep,
      state,
      slippage
    );
    return breakdown;
  }

  async fetchWithdrawStep(
    quote: ZapStrategyIdToWithdrawQuote<TId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.fetchWithdrawUserlessZapBreakdown(quote);
      const walletAction = zapExecuteOrder(quote.option.vaultId, zapRequest, expectedTokens);
      return walletAction(dispatch, getState, extraArgument);
    };

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: zapAction,
      pending: false,
      extraInfo: { zap: true, vaultId: quote.option.vaultId },
    };
  }
}
