import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash-es';
import { encodeFunctionData } from 'viem';
import { BoostAbi } from '../../../../../../config/abi/BoostAbi.ts';
import { bigNumberToBigInt } from '../../../../../../helpers/big-number.ts';
import type { Namespace, TFunction } from 'react-i18next';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { BoostPromoEntity } from '../../../../entities/promo.ts';
import { isTokenEqual, type TokenEntity, type TokenErc20 } from '../../../../entities/token.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { selectBoostById } from '../../../../selectors/boosts.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../../selectors/tokens.ts';
import { selectVaultPricePerFullShare } from '../../../../selectors/vaults.ts';
import type { BeefyThunk } from '../../../../store/types.ts';
import { oracleAmountToMooAmount } from '../../../../utils/ppfs.ts';
import { getInsertIndex } from '../../helpers/zap.ts';
import type {
  InputTokenAmount,
  ZapDepositQuote,
  ZapQuoteStepStake,
  ZapStrategyIdToDepositOption,
  ZapStrategyIdToDepositQuote,
  ZapStrategyIdToWithdrawOption,
  ZapStrategyIdToWithdrawQuote,
} from '../../transact-types.ts';
import type { ZapStep } from '../../zap/types.ts';
import type {
  IComposableStrategy,
  TransactHelpers,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { ZapStrategyId } from '../strategy-configs.ts';

type DepositOption = ZapStrategyIdToDepositOption<ZapStrategyId>;
type DepositQuote = ZapStrategyIdToDepositQuote<ZapStrategyId>;
type WithdrawOption = ZapStrategyIdToWithdrawOption<ZapStrategyId>;
type WithdrawQuote = ZapStrategyIdToWithdrawQuote<ZapStrategyId>;

const isSameAddress = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * Stakes the share output of a composable deposit route into a boost; the inner route stays boost-unaware.
 * Must be the outermost decorator: the stake has to run after the fee transfer and every other step.
 */
export class BoostStrategy implements IComposableStrategy {
  public readonly id: ZapStrategyId;
  private readonly shareToken: TokenErc20;
  private readonly receiptToken: TokenErc20;

  constructor(
    private readonly inner: IComposableStrategy,
    private readonly helpers: ZapTransactHelpers,
    private readonly boost: BoostPromoEntity
  ) {
    this.id = inner.id;
    const { vault, getState } = helpers;
    const state = getState();
    this.shareToken = selectErc20TokenByAddress(state, vault.chainId, vault.contractAddress);
    this.receiptToken = selectErc20TokenByAddress(state, boost.chainId, boost.contractAddress);
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
    option: DepositOption
  ): Promise<DepositQuote> {
    const quote = await this.inner.fetchDepositQuote(inputs, option);
    const stake: ZapQuoteStepStake = {
      type: 'stake',
      boostId: this.boost.id,
      inputs: [{ token: this.shareToken, amount: this.estimateShares(quote) }],
    };
    return { ...quote, steps: [...quote.steps, stake] } as DepositQuote;
  }

  async fetchDepositUserlessZapBreakdown(
    quote: DepositQuote
  ): Promise<UserlessZapDepositBreakdown> {
    const breakdown = await this.inner.fetchDepositUserlessZapBreakdown({
      ...quote,
      steps: quote.steps.filter(step => step.type !== 'stake'),
    } as DepositQuote);
    const { order, steps } = breakdown.zapRequest;

    const shareOutput = order.outputs.find(output =>
      isSameAddress(output.token, this.shareToken.address)
    );
    if (!shareOutput || shareOutput.minOutputAmount === '0') {
      throw new Error('Boost: inner route has no share token output to stake');
    }

    steps.push(this.buildStakeZapStep(new BigNumber(shareOutput.minOutputAmount)));
    // stake mints the receipt 1:1 for the shares it pulls: the share floor moves to the receipt, shares become dust
    order.outputs = [
      { token: this.receiptToken.address, minOutputAmount: shareOutput.minOutputAmount },
      ...order.outputs.map(output =>
        output === shareOutput ? { ...output, minOutputAmount: '0' } : output
      ),
    ];

    const shares = breakdown.minBalances.get(this.shareToken);
    if (shares.gt(0)) {
      breakdown.minBalances.subtract({ token: this.shareToken, amount: shares });
      breakdown.minBalances.add({ token: this.receiptToken, amount: shares });
    }
    breakdown.expectedTokens = uniqBy([this.receiptToken, ...breakdown.expectedTokens], token =>
      token.address.toLowerCase()
    );

    return breakdown;
  }

  async fetchDepositStep(quote: DepositQuote, t: TFunction<Namespace>): Promise<Step> {
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

  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote> {
    return this.inner.fetchWithdrawQuote(inputs, option);
  }

  fetchWithdrawUserlessZapBreakdown(quote: WithdrawQuote): Promise<UserlessZapWithdrawBreakdown> {
    return this.inner.fetchWithdrawUserlessZapBreakdown(quote);
  }

  fetchWithdrawStep(quote: WithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    return this.inner.fetchWithdrawStep(quote, t);
  }

  // listing the share token in `tokens` approves the boost to pull it and rewrites the amount to the router's balance
  private buildStakeZapStep(amountWei: BigNumber): ZapStep {
    return {
      target: this.boost.contractAddress,
      value: '0',
      data: encodeFunctionData({
        abi: BoostAbi,
        functionName: 'stake',
        args: [bigNumberToBigInt(amountWei)],
      }),
      tokens: [{ token: this.shareToken.address, index: getInsertIndex(0) }],
    };
  }

  // most routes quote their output in the deposit token; composer routes already quote shares
  private estimateShares(quote: ZapDepositQuote): BigNumber {
    const output = quote.outputs[0];
    if (!output) {
      return new BigNumber(0);
    }
    if (isTokenEqual(output.token, this.shareToken)) {
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

/** the route as is, or decorated to also stake into `boostId` */
export function withBoost(
  strategy: IComposableStrategy,
  helpers: ZapTransactHelpers,
  boostId: BoostPromoEntity['id'] | undefined
): IComposableStrategy {
  return boostId ?
      new BoostStrategy(strategy, helpers, selectBoostById(helpers.getState(), boostId))
    : strategy;
}
