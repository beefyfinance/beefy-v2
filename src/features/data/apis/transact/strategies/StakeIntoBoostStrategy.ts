import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { toWei, toWeiString } from '../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../actions/wallet/zap.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { TokenEntity, TokenErc20 } from '../../../entities/token.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../selectors/transact.ts';
import { selectVaultPricePerFullShare } from '../../../selectors/vaults.ts';
import type { BeefyThunk } from '../../../store/types.ts';
import { oracleAmountToMooAmount } from '../../../utils/ppfs.ts';
import { slipBy } from '../helpers/amounts.ts';
import { ZERO_FEE } from '../helpers/quotes.ts';
import {
  buildBoostStakeZapStep,
  getBoostReceiptToken,
  isBoostStakeStep,
} from '../helpers/boost.ts';
import { getTokenAddress, NO_RELAY } from '../helpers/zap.ts';
import {
  type DepositOption,
  type DepositQuote,
  type InputTokenAmount,
  type WithdrawOption,
  type WithdrawQuote,
  type ZapQuoteStepStake,
  type ZapStrategyIdToDepositOption,
  type ZapStrategyIdToDepositQuote,
  type ZapStrategyIdToWithdrawOption,
  type ZapStrategyIdToWithdrawQuote,
} from '../transact-types.ts';
import { isStandardVaultType } from '../vaults/IVaultType.ts';
import type { OrderOutput, UserlessZapRequest } from '../zap/types.ts';
import type {
  IComposableStrategy,
  IStrategy,
  TransactHelpers,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from './IStrategy.ts';
import type { ZapStrategyId } from './strategy-configs.ts';

function resolveTokens(helpers: ZapTransactHelpers, boost: BoostPromoEntity) {
  const { vault, getState } = helpers;
  const shareToken = selectErc20TokenByAddress(getState(), vault.chainId, vault.contractAddress);
  return { shareToken, receiptToken: getBoostReceiptToken(boost, shareToken) };
}

/**
 * Must be the outermost decorator: ChargeFeeStrategy prepends its fee transfer and rewrites the
 * order inputs, and the stake has to run after every other step has settled the share token.
 */
export class StakeIntoBoostZapStrategy<
  TId extends ZapStrategyId = ZapStrategyId,
> implements IComposableStrategy<TId> {
  public readonly id: TId;
  protected readonly shareToken: TokenErc20;
  protected readonly receiptToken: TokenErc20;

  constructor(
    protected inner: IComposableStrategy<TId>,
    protected helpers: ZapTransactHelpers,
    protected boost: BoostPromoEntity
  ) {
    this.id = inner.id;
    const { shareToken, receiptToken } = resolveTokens(helpers, boost);
    this.shareToken = shareToken;
    this.receiptToken = receiptToken;
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

  /**
   * `outputs` stays priced in the share/deposit token: the receipt has no oracle, so swapping it
   * there would zero out price impact and the re-quote check.
   */
  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToDepositOption<TId>
  ): Promise<ZapStrategyIdToDepositQuote<TId>> {
    const innerQuote = await this.inner.fetchDepositQuote(inputs, option);
    const stakeStep: ZapQuoteStepStake = {
      type: 'stake',
      boostId: this.boost.id,
      inputs: [
        {
          token: this.shareToken,
          amount: this.estimateShareAmount(innerQuote),
        },
      ],
    };

    return {
      ...innerQuote,
      steps: [...innerQuote.steps, stakeStep],
    } as ZapStrategyIdToDepositQuote<TId>;
  }

  async fetchDepositUserlessZapBreakdown(
    quote: ZapStrategyIdToDepositQuote<TId>
  ): Promise<UserlessZapDepositBreakdown> {
    const innerQuote = {
      ...quote,
      steps: quote.steps.filter(step => !isBoostStakeStep(step)),
    } as ZapStrategyIdToDepositQuote<TId>;
    const breakdown = await this.inner.fetchDepositUserlessZapBreakdown(innerQuote);

    const shareAddress = this.shareToken.address.toLowerCase();
    const outputs = breakdown.zapRequest.order.outputs;
    const shareOutput = outputs.find(output => output.token.toLowerCase() === shareAddress);
    if (!shareOutput || shareOutput.minOutputAmount === '0') {
      throw new Error('Invalid breakdown: no share token output to stake into boost');
    }

    breakdown.zapRequest.steps.push(
      buildBoostStakeZapStep(
        this.boost,
        this.shareToken,
        new BigNumber(shareOutput.minOutputAmount)
      )
    );

    // stake mints exactly what it pulls, so the share token's own floor carries over unchanged
    breakdown.zapRequest.order.outputs = [
      { token: this.receiptToken.address, minOutputAmount: shareOutput.minOutputAmount },
      ...outputs.map(output =>
        output.token.toLowerCase() === shareAddress ? { ...output, minOutputAmount: '0' } : output
      ),
    ];

    const shareBalance = breakdown.minBalances.get(this.shareToken);
    if (shareBalance.gt(0)) {
      breakdown.minBalances.subtract({ token: this.shareToken, amount: shareBalance });
      breakdown.minBalances.add({ token: this.receiptToken, amount: shareBalance });
    }

    breakdown.expectedTokens = uniqBy([this.receiptToken, ...breakdown.expectedTokens], token =>
      token.address.toLowerCase()
    );

    return breakdown;
  }

  async fetchDepositStep(
    quote: ZapStrategyIdToDepositQuote<TId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.fetchDepositUserlessZapBreakdown(quote);
      const walletAction = zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens,
        this.boost.id
      );
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

  fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToWithdrawOption<TId>
  ): Promise<ZapStrategyIdToWithdrawQuote<TId>> {
    return this.inner.fetchWithdrawQuote(inputs, option);
  }

  fetchWithdrawUserlessZapBreakdown(
    quote: ZapStrategyIdToWithdrawQuote<TId>
  ): Promise<UserlessZapWithdrawBreakdown> {
    return this.inner.fetchWithdrawUserlessZapBreakdown(quote);
  }

  fetchWithdrawStep(
    quote: ZapStrategyIdToWithdrawQuote<TId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    return this.inner.fetchWithdrawStep(quote, t);
  }

  /** Most strategies quote outputs in the deposit token; vault-composer already relabels to shares */
  protected estimateShareAmount(quote: DepositQuote): BigNumber {
    const output = quote.outputs[0];
    if (!output) {
      return new BigNumber(0);
    }
    if (output.token.address.toLowerCase() === this.shareToken.address.toLowerCase()) {
      return output.amount;
    }

    const { vault, getState } = this.helpers;
    const state = getState();
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    return oracleAmountToMooAmount(
      this.shareToken,
      depositToken,
      selectVaultPricePerFullShare(state, vault.id),
      output.amount
    );
  }
}

/** The plain same-token deposit has no route to append to, so it is rebuilt as deposit + stake */
export class StakeIntoBoostVaultStrategy implements IStrategy<'vault'> {
  public readonly id = 'vault' as const;
  protected readonly shareToken: TokenErc20;
  protected readonly receiptToken: TokenErc20;

  constructor(
    protected inner: IStrategy<'vault'>,
    protected helpers: ZapTransactHelpers,
    protected boost: BoostPromoEntity
  ) {
    const { shareToken, receiptToken } = resolveTokens(helpers, boost);
    this.shareToken = shareToken;
    this.receiptToken = receiptToken;
  }

  fetchDepositOptions(): Promise<DepositOption[]> {
    return this.inner.fetchDepositOptions();
  }

  /**
   * Routing through the zap moves the approval target, and `steps` is what makes the UI show the
   * route and the slippage control that the order is now subject to.
   */
  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: DepositOption
  ): Promise<DepositQuote> {
    const quote = await this.inner.fetchDepositQuote(inputs, option);
    const state = this.helpers.getState();
    const shares = oracleAmountToMooAmount(
      this.shareToken,
      quote.outputs[0].token,
      selectVaultPricePerFullShare(state, this.helpers.vault.id),
      quote.outputs[0].amount
    );

    return {
      ...quote,
      allowances: quote.allowances.map(allowance => ({
        ...allowance,
        spenderAddress: this.helpers.zap.manager,
      })),
      steps: [
        { type: 'deposit', inputs: quote.inputs.map(({ token, amount }) => ({ token, amount })) },
        {
          type: 'stake',
          boostId: this.boost.id,
          inputs: [{ token: this.shareToken, amount: shares }],
        },
      ],
      // same-token deposit through the zap is free, matching VaultComposerStrategy's vault path
      fee: ZERO_FEE,
    } as DepositQuote;
  }

  async fetchDepositStep(quote: DepositQuote, t: TFunction<Namespace>): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { vault, vaultType, zap } = this.helpers;
      if (!isStandardVaultType(vaultType)) {
        throw new Error('Vault type is not standard');
      }

      const slippage = selectTransactSlippage(getState());
      const depositZap = await vaultType.fetchZapDeposit({
        inputs: quote.inputs,
        from: zap.router,
      });

      // ppfs is read live here, so the share output still needs slipping
      const shareOutput = depositZap.outputs[0];
      const minShares = slipBy(shareOutput.amount, slippage, this.shareToken.decimals);
      const minSharesWei = toWeiString(minShares, this.shareToken.decimals);

      const dustOutputs: OrderOutput[] = [this.shareToken, ...quote.inputs.map(i => i.token)].map(
        token => ({ token: getTokenAddress(token), minOutputAmount: '0' })
      );

      const zapRequest: UserlessZapRequest = {
        order: {
          inputs: quote.inputs.map(input => ({
            token: getTokenAddress(input.token),
            amount: toWeiString(input.amount, input.token.decimals),
          })),
          outputs: uniqBy(
            [{ token: this.receiptToken.address, minOutputAmount: minSharesWei }, ...dustOutputs],
            output => output.token
          ),
          relay: NO_RELAY,
        },
        steps: [
          depositZap.zap,
          buildBoostStakeZapStep(
            this.boost,
            this.shareToken,
            toWei(minShares, this.shareToken.decimals)
          ),
        ],
      };

      const walletAction = zapExecuteOrder(
        vault.id,
        zapRequest,
        [this.receiptToken, this.shareToken],
        this.boost.id
      );
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

  fetchWithdrawOptions(): Promise<WithdrawOption[]> {
    return this.inner.fetchWithdrawOptions();
  }

  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote> {
    return this.inner.fetchWithdrawQuote(inputs, option);
  }

  fetchWithdrawStep(quote: WithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.inner.fetchWithdrawStep(quote, t);
  }
}
