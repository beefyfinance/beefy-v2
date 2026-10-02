import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { fromWei } from '../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../actions/wallet/zap.ts';
import type { BoostPromoEntity } from '../../../entities/promo.ts';
import type { TokenEntity, TokenErc20 } from '../../../entities/token.ts';
import { isStandardVault } from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectVaultPricePerFullShare } from '../../../selectors/vaults.ts';
import type { BeefyThunk } from '../../../store/types.ts';
import { oracleAmountToMooAmount } from '../../../utils/ppfs.ts';
import {
  buildBoostStakeZapStep,
  buildBoostWithdrawZapStep,
  getBoostRouteTokens,
  isBoostStakeStep,
  isBoostUnstakeStep,
} from '../helpers/boost.ts';
import { ZERO_FEE } from '../helpers/quotes.ts';
import { getVaultWithdrawnFromState } from '../helpers/vault.ts';
import {
  type DepositQuote,
  type InputTokenAmount,
  isZapQuote,
  type WithdrawQuote,
  type ZapQuoteStep,
  type ZapQuoteStepStake,
  type ZapQuoteStepUnstake,
  type ZapStrategyIdToDepositOption,
  type ZapStrategyIdToDepositQuote,
  type ZapStrategyIdToWithdrawOption,
  type ZapStrategyIdToWithdrawQuote,
} from '../transact-types.ts';
import type {
  ComposableSurface,
  IComposableStrategy,
  IStrategy,
  TransactHelpers,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from './IStrategy.ts';
import type { ZapStrategyId } from './strategy-configs.ts';

function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export type BoostDecoratable = IStrategy & ComposableSurface;

/**
 * Must be the outermost decorator: ChargeFeeStrategy prepends its deposit fee transfer and rewrites
 * the order inputs, and the stake has to run after every other step has settled the share token.
 */
export class BoostZapStrategy<
  TId extends ZapStrategyId = ZapStrategyId,
> implements IComposableStrategy<TId> {
  public readonly id: TId;
  protected readonly shareToken: TokenErc20;
  protected readonly receiptToken: TokenErc20;

  constructor(
    protected inner: BoostDecoratable,
    protected helpers: ZapTransactHelpers,
    protected boost: BoostPromoEntity
  ) {
    // 'vault' is not a ZapStrategyId, but every consumer keys off the option's strategyId, not this
    this.id = inner.id as TId;
    const { shareToken, receiptToken } = getBoostRouteTokens(helpers, boost);
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
    return this.inner.fetchDepositOptions() as Promise<ZapStrategyIdToDepositOption<TId>[]>;
  }

  fetchWithdrawOptions() {
    return this.inner.fetchWithdrawOptions() as Promise<ZapStrategyIdToWithdrawOption<TId>[]>;
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
      inputs: [{ token: this.shareToken, amount: this.estimateShareAmount(innerQuote) }],
    };
    // `steps` is what marks a quote as a zap: route display, slippage and the impact gate follow it
    const innerSteps: ZapQuoteStep[] =
      isZapQuote(innerQuote) ?
        innerQuote.steps
      : [
          {
            type: 'deposit',
            inputs: innerQuote.inputs.map(({ token, amount }) => ({ token, amount })),
          },
        ];

    return {
      ...innerQuote,
      // the order is pulled by the manager, wherever the undecorated route sent its approval
      allowances: innerQuote.allowances.map(allowance => ({
        ...allowance,
        spenderAddress: this.helpers.zap.manager,
      })),
      steps: [...innerSteps, stakeStep],
      // staking a route that was already same-token is free, as it was before the zap carried it
      fee: isZapQuote(innerQuote) ? innerQuote.fee : ZERO_FEE,
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

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: ZapStrategyIdToWithdrawOption<TId>
  ): Promise<ZapStrategyIdToWithdrawQuote<TId>> {
    const innerQuote = await this.inner.fetchWithdrawQuote(inputs, option);
    const shares = this.sharesToUnstake(innerQuote);
    const unstakeStep: ZapQuoteStepUnstake = {
      type: 'unstake',
      boostId: this.boost.id,
      outputs: [{ token: this.shareToken, amount: shares }],
    };
    const innerSteps: ZapQuoteStep[] =
      isZapQuote(innerQuote) ?
        innerQuote.steps
      : [
          {
            type: 'withdraw',
            outputs: innerQuote.outputs.map(({ token, amount }) => ({ token, amount })),
          },
        ];
    // the router pulls the receipt, not the share token; the plain route approves nothing to move
    const hasShareAllowance = innerQuote.allowances.some(allowance =>
      isSameAddress(allowance.token.address, this.shareToken.address)
    );
    const allowances =
      hasShareAllowance ?
        innerQuote.allowances.map(allowance =>
          isSameAddress(allowance.token.address, this.shareToken.address) ?
            { ...allowance, token: this.receiptToken }
          : allowance
        )
      : innerQuote.allowances.concat({
          token: this.receiptToken,
          amount: shares,
          spenderAddress: this.helpers.zap.manager,
        });

    return {
      ...innerQuote,
      steps: [unstakeStep, ...innerSteps],
      allowances,
      fee: isZapQuote(innerQuote) ? innerQuote.fee : ZERO_FEE,
    } as ZapStrategyIdToWithdrawQuote<TId>;
  }

  async fetchWithdrawUserlessZapBreakdown(
    quote: ZapStrategyIdToWithdrawQuote<TId>
  ): Promise<UserlessZapWithdrawBreakdown> {
    const innerQuote = {
      ...quote,
      steps: quote.steps.filter(step => !isBoostUnstakeStep(step)),
    } as ZapStrategyIdToWithdrawQuote<TId>;
    const breakdown = await this.inner.fetchWithdrawUserlessZapBreakdown(innerQuote);

    const input = breakdown.zapRequest.order.inputs.find(orderInput =>
      isSameAddress(orderInput.token, this.shareToken.address)
    );
    if (!input) {
      throw new Error('Invalid breakdown: no share token input to unstake from boost');
    }

    // receipt is 1:1 with shares, so only the token changes
    input.token = this.receiptToken.address;
    breakdown.zapRequest.steps.unshift(
      buildBoostWithdrawZapStep(this.boost, new BigNumber(input.amount))
    );
    // the receipt is an order input now, so list it as an output too and any dust comes back
    breakdown.zapRequest.order.outputs = uniqBy(
      breakdown.zapRequest.order.outputs.concat({
        token: this.receiptToken.address,
        minOutputAmount: '0',
      }),
      output => output.token
    );

    return breakdown;
  }

  async fetchWithdrawStep(
    quote: ZapStrategyIdToWithdrawQuote<TId>,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const { zapRequest, expectedTokens } = await this.fetchWithdrawUserlessZapBreakdown(quote);
      const walletAction = zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens,
        this.boost.id
      );
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

  /**
   * Zap routes carry a share-token allowance to unstake against; the plain vault route carries
   * none, so its shares are recomputed from state, as its own withdraw quote does.
   */
  protected sharesToUnstake(quote: WithdrawQuote): BigNumber {
    const allowance = quote.allowances.find(entry =>
      isSameAddress(entry.token.address, this.shareToken.address)
    );
    if (allowance) {
      return allowance.amount;
    }

    const { vault, getState } = this.helpers;
    if (!isStandardVault(vault)) {
      throw new Error('Invalid quote: no share token allowance to unstake from boost');
    }
    const { sharesToWithdrawWei } = getVaultWithdrawnFromState(quote.inputs[0], vault, getState());
    return fromWei(sharesToWithdrawWei, this.shareToken.decimals);
  }

  /** Most strategies quote outputs in the deposit token; vault-composer already relabels to shares */
  protected estimateShareAmount(quote: DepositQuote): BigNumber {
    const output = quote.outputs[0];
    if (!output) {
      return new BigNumber(0);
    }
    if (isSameAddress(output.token.address, this.shareToken.address)) {
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
