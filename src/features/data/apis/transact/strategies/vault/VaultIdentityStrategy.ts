import { uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { BIG_ZERO, fromWei, toWeiString } from '../../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import { isTokenEqual, isTokenErc20, type TokenEntity } from '../../../../entities/token.ts';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import type { BeefyThunk } from '../../../../store/types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import { Balances } from '../../helpers/Balances.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyOneInput,
} from '../../helpers/options.ts';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes.ts';
import { pickTokens } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import {
  type InputTokenAmount,
  SelectionOrder,
  type VaultIdentityDepositOption,
  type VaultIdentityDepositQuote,
  type VaultIdentityWithdrawOption,
  type VaultIdentityWithdrawQuote,
} from '../../transact-types.ts';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType.ts';
import type { OrderInput, OrderOutput, UserlessZapRequest } from '../../zap/types.ts';
import type {
  IComposableStrategy,
  IComposableStrategyStatic,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { VaultIdentityStrategyConfig } from '../strategy-configs.ts';

const strategyId = 'vault-identity';
type StrategyId = typeof strategyId;

/**
 * The plain deposit-token route expressed as a zap order, so it can be composed (e.g. decorated with a boost).
 * Not configured per vault: transact.ts builds it where a composable plain route is needed.
 */
class VaultIdentityStrategyImpl implements IComposableStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composable = true;
  public readonly id = strategyId;

  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;

  constructor(
    protected options: VaultIdentityStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    const { vault, vaultType } = this.helpers;
    if (!isStandardVault(vault) || !isStandardVaultType(vaultType)) {
      throw new Error('Vault is not a standard vault');
    }
    this.vault = vault;
    this.vaultType = vaultType;
  }

  getHelpers(): ZapTransactHelpers {
    return this.helpers;
  }

  async canAcceptTokenAsDeposit(token: TokenEntity): Promise<boolean> {
    return isTokenEqual(token, this.vaultType.depositToken);
  }

  async canEmitTokenAsWithdraw(token: TokenEntity): Promise<boolean> {
    return isTokenEqual(token, this.vaultType.depositToken);
  }

  async fetchDepositOptions(): Promise<VaultIdentityDepositOption[]> {
    const inputs = [this.vaultType.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return [
      {
        id: createOptionId(strategyId, this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.Want,
        inputs,
        wantedOutputs: inputs,
        strategyId,
        mode: TransactMode.Deposit,
        feeable: false,
      },
    ];
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: VaultIdentityDepositOption
  ): Promise<VaultIdentityDepositQuote> {
    const { zap, getState } = this.helpers;
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }
    if (!isTokenEqual(input.token, this.vaultType.depositToken)) {
      throw new Error('Input token is not the deposit token');
    }

    const allowances =
      isTokenErc20(input.token) ?
        [{ token: input.token, amount: input.amount, spenderAddress: zap.manager }]
      : [];
    const outputs = [{ token: input.token, amount: input.amount }];

    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, [], getState()),
      option,
      inputs,
      outputs,
      returned: [],
      allowances,
      steps: [{ type: 'deposit', inputs: [{ token: input.token, amount: input.amount }] }],
      fee: ZERO_FEE,
    };
  }

  async fetchDepositStep(quote: VaultIdentityDepositQuote, t: TFunction<Namespace>): Promise<Step> {
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

  async fetchDepositUserlessZapBreakdown(
    quote: VaultIdentityDepositQuote
  ): Promise<UserlessZapDepositBreakdown> {
    const { zap, getState } = this.helpers;
    const slippage = selectTransactSlippage(getState());
    const minBalances = new Balances(quote.inputs);

    const vaultDeposit = await this.vaultType.fetchZapDeposit({
      inputs: [{ ...onlyOneInput(quote.inputs), max: true }],
      from: zap.router,
    });
    minBalances.subtractMany(vaultDeposit.inputs);
    minBalances.addMany(vaultDeposit.minOutputs);

    const inputs: OrderInput[] = quote.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));

    // ppfs is read live by fetchZapDeposit, so the shares still need slipping
    const requiredOutputs: OrderOutput[] = vaultDeposit.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));
    const dustOutputs: OrderOutput[] = quote.inputs.map(input => ({
      token: getTokenAddress(input.token),
      minOutputAmount: '0',
    }));

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs,
        outputs: uniqBy(requiredOutputs.concat(dustOutputs), output => output.token),
        relay: NO_RELAY,
      },
      steps: [vaultDeposit.zap],
    };

    return {
      zapRequest,
      expectedTokens: vaultDeposit.outputs.map(output => output.token),
      minBalances,
    };
  }

  async fetchWithdrawOptions(): Promise<VaultIdentityWithdrawOption[]> {
    const inputs = [this.vaultType.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return [
      {
        id: createOptionId(strategyId, this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: SelectionOrder.Want,
        inputs,
        wantedOutputs: inputs,
        strategyId,
        mode: TransactMode.Withdraw,
        feeable: false,
      },
    ];
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: VaultIdentityWithdrawOption
  ): Promise<VaultIdentityWithdrawQuote> {
    const { zap, getState } = this.helpers;
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    const state = getState();
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, this.vaultType, state);
    const outputs = [
      {
        token: withdrawnToken,
        amount: fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals),
      },
    ];

    return {
      id: createQuoteId(option.id),
      strategyId,
      priceImpact: calculatePriceImpact(inputs, outputs, [], state),
      option,
      inputs,
      outputs,
      returned: [],
      allowances: [
        {
          token: shareToken,
          amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
          spenderAddress: zap.manager,
        },
      ],
      steps: [{ type: 'withdraw', outputs }],
      fee: ZERO_FEE,
    };
  }

  async fetchWithdrawStep(
    quote: VaultIdentityWithdrawQuote,
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

  async fetchWithdrawUserlessZapBreakdown(
    quote: VaultIdentityWithdrawQuote
  ): Promise<UserlessZapWithdrawBreakdown> {
    const { zap, getState } = this.helpers;
    const slippage = selectTransactSlippage(getState());

    const vaultWithdraw = await this.vaultType.fetchZapWithdraw({
      inputs: quote.inputs,
      from: zap.router,
    });

    // the order is paid in shares, while the quote inputs are in deposit token
    const inputs: OrderInput[] = vaultWithdraw.inputs.map(input => ({
      token: getTokenAddress(input.token),
      amount: toWeiString(input.amount, input.token.decimals),
    }));

    const requiredOutputs: OrderOutput[] = quote.outputs.map(output => ({
      token: getTokenAddress(output.token),
      minOutputAmount: toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      ),
    }));
    const dustOutputs: OrderOutput[] = pickTokens(vaultWithdraw.inputs, quote.outputs).map(
      token => ({ token: getTokenAddress(token), minOutputAmount: '0' })
    );

    const zapRequest: UserlessZapRequest = {
      order: {
        inputs,
        outputs: uniqBy(requiredOutputs.concat(dustOutputs), output => output.token),
        relay: NO_RELAY,
      },
      steps: [vaultWithdraw.zap],
    };

    return { zapRequest, expectedTokens: quote.outputs.map(output => output.token) };
  }
}

export const VaultIdentityStrategy =
  VaultIdentityStrategyImpl satisfies IComposableStrategyStatic<StrategyId>;
