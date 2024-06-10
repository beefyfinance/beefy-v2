import type { IStrategy, SingleStrategyOptions, ZapTransactHelpers } from '../IStrategy';
import type {
  InputTokenAmount,
  SingleDepositOption,
  SingleDepositQuote,
  SingleWithdrawOption,
  SingleWithdrawQuote,
  TokenAmount,
  ZapFee,
  ZapQuoteStep,
  ZapQuoteStepSwapAggregator,
} from '../../transact-types';
import {
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
} from '../../transact-types';
import type { BeefyState, BeefyThunk } from '../../../../../../redux-types';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyAssetCount,
  onlyOneInput,
  onlyOneToken,
} from '../../helpers/options';
import { first, uniqBy } from 'lodash-es';
import { BIG_ZERO, fromWei, toWeiString } from '../../../../../../helpers/big-number';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { walletActions } from '../../../../actions/wallet-actions';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../../zap/types';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap';
import type { Step } from '../../../../reducers/wallet/stepper';
import type { Namespace, TFunction } from 'react-i18next';
import { getVaultWithdrawnFromState } from '../../helpers/vault';
import { isStandardVault, type VaultStandard } from '../../../../entities/vault';
import { slipBy } from '../../helpers/amounts';
import { nativeAndWrappedAreSame, pickTokens } from '../../helpers/tokens';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
} from '../../../../selectors/tokens';
import { fetchZapAggregatorSwap } from '../../zap/swap';
import type { ChainEntity } from '../../../../entities/chain';
import { selectChainById } from '../../../../selectors/chains';
import { isStandardVaultType, type IStandardVaultType } from '../../vaults/IVaultType';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

export class SingleStrategy implements IStrategy {
  public readonly id = 'single';
  protected readonly wnative: TokenErc20;
  protected readonly native: TokenNative;
  protected readonly vault: VaultStandard;
  protected readonly vaultType: IStandardVaultType;

  constructor(protected options: SingleStrategyOptions, protected helpers: ZapTransactHelpers) {
    // Make sure zap was configured correctly for this vault
    const { vault, vaultType, getState } = this.helpers;

    if (!isStandardVault(vault)) {
      throw new Error('Vault is not a standard vault');
    }
    if (!isStandardVaultType(vaultType)) {
      throw new Error('Vault type is not standard');
    }

    onlyAssetCount(vault, 1);

    // configure
    const state = getState();
    this.vault = vault;
    this.vaultType = vaultType;
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
  }

  async aggregatorTokenSupport() {
    const { swapAggregator, getState } = this.helpers;

    const state = getState();
    const tokenSupport = await swapAggregator.fetchTokenSupport(
      [this.vaultType.depositToken],
      this.vault.id,
      this.vault.chainId,
      state,
      this.options.swap
    );
    return tokenSupport.any;
  }

  async fetchDepositOptions(): Promise<SingleDepositOption[]> {
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const tokens = supportedAggregatorTokens.filter(
      token => !isTokenEqual(token, this.vaultType.depositToken)
    );
    const outputs = [this.vaultType.depositToken];

    return tokens.map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, inputs);

      return {
        id: createOptionId('single', this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        strategyId: 'single',
        mode: TransactMode.Deposit,
      };
    });
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: SingleDepositOption
  ): Promise<SingleDepositQuote> {
    const { swapAggregator, zap, getState } = this.helpers;

    // Input
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    // Token Allowances
    const allowances = isTokenErc20(input.token)
      ? [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: zap.manager,
          },
        ]
      : [];

    // Swap + Output
    const state = getState();
    const swapQuotes = await swapAggregator.fetchQuotes(
      {
        vaultId: this.vault.id,
        fromToken: input.token,
        fromAmount: input.amount,
        toToken: this.vaultType.depositToken,
      },
      state
    );
    const bestQuote = first(swapQuotes); // already sorted by toAmount
    if (!bestQuote) {
      throw new Error('No swap quote found');
    }

    const outputs = [{ token: this.vaultType.depositToken, amount: bestQuote.toAmount }];
    const steps: ZapQuoteStep[] = [
      {
        type: 'swap',
        fromToken: bestQuote.fromToken,
        fromAmount: bestQuote.fromAmount,
        toToken: bestQuote.toToken,
        toAmount: bestQuote.toAmount,
        via: 'aggregator',
        providerId: bestQuote.providerId,
        fee: bestQuote.fee,
        quote: bestQuote,
      },
      {
        type: 'deposit',
        inputs: [{ token: bestQuote.toToken, amount: bestQuote.toAmount }],
      },
    ];

    return {
      id: createQuoteId(option.id),
      strategyId: 'single',
      swapQuote: bestQuote,
      priceImpact: calculatePriceImpact(inputs, outputs, [], state), // includes the zap fee
      option,
      inputs,
      outputs,
      returned: [],
      allowances,
      steps,
      fee: bestQuote.fee,
    };
  }

  async fetchDepositStep(quote: SingleDepositQuote, t: TFunction<Namespace>): Promise<Step> {
    const { zap, swapAggregator } = this.helpers;

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);

      // Step 1. Swap
      const swap = await swapAggregator.fetchSwap(
        quote.swapQuote.providerId,
        {
          quote: quote.swapQuote,
          fromAddress: zap.router,
          slippage,
        },
        state
      );

      const steps: ZapStep[] = [
        {
          target: swap.tx.toAddress,
          value: swap.tx.value,
          data: swap.tx.data,
          tokens: [
            {
              token: getTokenAddress(swap.fromToken),
              index: -1, // not dynamically inserted
            },
          ],
        },
      ];

      // Step 2. Deposit to vault
      const vaultDeposit = await this.vaultType.fetchZapDeposit({
        inputs: [
          {
            token: swap.toToken,
            amount: slipBy(swap.toAmount, slippage, swap.toToken.decimals), // min expected in case add liquidity slipped
            max: true, // but we call depositAll
          },
        ],
      });

      steps.push(vaultDeposit.zap);

      // Build order
      const inputs: OrderInput[] = quote.inputs.map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      const requiredOutputs: OrderOutput[] = vaultDeposit.outputs.map(output => ({
        token: getTokenAddress(output.token),
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
      const dustOutputs: OrderOutput[] = quote.outputs.concat(quote.inputs).map(input => ({
        token: getTokenAddress(input.token),
        minOutputAmount: '0',
      }));

      // @dev uniqBy: first occurrence of each element is kept.
      const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

      // Perform TX
      const zapRequest: UserlessZapRequest = {
        order: {
          inputs,
          outputs,
          relay: NO_RELAY,
        },
        steps,
      };

      const expectedTokens = vaultDeposit.outputs.map(output => output.token);
      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens
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

  async fetchWithdrawOptions(): Promise<SingleWithdrawOption[]> {
    const supportedAggregatorTokens = await this.aggregatorTokenSupport();
    const tokens = supportedAggregatorTokens.filter(
      token => !isTokenEqual(token, this.vaultType.depositToken)
    );
    const inputs = [this.vaultType.depositToken];

    return tokens.map(token => {
      const outputs = [token];
      const selectionId = createSelectionId(this.vault.chainId, outputs);

      return {
        id: createOptionId('single', this.vault.id, selectionId),
        vaultId: this.vault.id,
        chainId: this.vault.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        strategyId: 'single',
        mode: TransactMode.Withdraw,
      };
    });
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: SingleWithdrawOption
  ): Promise<SingleWithdrawQuote> {
    const { vault, swapAggregator, zap, getState } = this.helpers;
    if (!isStandardVault(vault)) {
      throw new Error('Vault is not standard');
    }

    // Input
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    // Token Allowances
    const state = getState();
    const { withdrawnAmountAfterFeeWei, withdrawnToken, shareToken, sharesToWithdrawWei } =
      getVaultWithdrawnFromState(input, vault, state);
    const withdrawnAmountAfterFee = fromWei(withdrawnAmountAfterFeeWei, withdrawnToken.decimals);
    const allowances = [
      {
        token: shareToken,
        amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
        spenderAddress: zap.manager,
      },
    ];

    // Step 1. Withdraw from vault
    const steps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        outputs: [
          {
            token: withdrawnToken,
            amount: withdrawnAmountAfterFee,
          },
        ],
      },
    ];

    // Step 2. Wrap native if needed
    if (isTokenNative(withdrawnToken) && !nativeAndWrappedAreSame(withdrawnToken.chainId)) {
      const { swapAggregator, getState } = this.helpers;
      const state = getState();
      const wrapQuotes = await swapAggregator.fetchQuotes(
        {
          fromAmount: withdrawnAmountAfterFee,
          fromToken: withdrawnToken,
          toToken: this.wnative,
          vaultId: this.vault.id,
        },
        state
      );
      const wrapQuote = first(wrapQuotes);
      if (!wrapQuote || wrapQuote.toAmount.lt(withdrawnAmountAfterFee)) {
        throw new Error('No wrap quote found');
      }

      steps.push({
        type: 'swap',
        fromToken: wrapQuote.fromToken,
        fromAmount: wrapQuote.fromAmount,
        toToken: wrapQuote.toToken,
        toAmount: wrapQuote.toAmount,
        via: 'aggregator',
        providerId: wrapQuote.providerId,
        fee: wrapQuote.fee,
        quote: wrapQuote,
      });
    }

    // Step 3. Swap if needed
    const swapInputToken = isTokenNative(withdrawnToken) ? this.wnative : withdrawnToken;
    const swapInputAmount = withdrawnAmountAfterFee;
    const swapOutputToken = onlyOneToken(option.wantedOutputs);
    let outputs: TokenAmount[] = [{ token: swapInputToken, amount: swapInputAmount }];
    let fee: ZapFee = ZERO_FEE;

    if (!isTokenEqual(swapInputToken, swapOutputToken)) {
      const swapQuotes = await swapAggregator.fetchQuotes(
        {
          vaultId: this.vault.id,
          fromToken: swapInputToken,
          fromAmount: swapInputAmount,
          toToken: swapOutputToken,
        },
        state
      );
      const bestQuote = first(swapQuotes); // already sorted by toAmount
      if (!bestQuote) {
        throw new Error('No swap quote found');
      }

      steps.push({
        type: 'swap',
        fromToken: bestQuote.fromToken,
        fromAmount: bestQuote.fromAmount,
        toToken: bestQuote.toToken,
        toAmount: bestQuote.toAmount,
        via: 'aggregator',
        providerId: bestQuote.providerId,
        fee: bestQuote.fee,
        quote: bestQuote,
      });

      // set outputs
      outputs = [{ token: bestQuote.toToken, amount: bestQuote.toAmount }];
      fee = bestQuote.fee;
    }

    return {
      id: createQuoteId(option.id),
      strategyId: 'single',
      priceImpact: calculatePriceImpact(inputs, outputs, [], state), // includes the zap fee.
      option,
      inputs,
      outputs,
      returned: [],
      allowances,
      steps,
      fee,
    };
  }

  async fetchWithdrawStep(quote: SingleWithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const chain = selectChainById(state, this.vault.chainId);
      const slippage = selectTransactSlippage(state);
      const zapHelpers: ZapHelpers = { chain, slippage, state };
      const withdrawQuote = quote.steps.find(isZapQuoteStepWithdraw);
      const swapQuotes = quote.steps
        .filter(isZapQuoteStepSwap)
        .filter(isZapQuoteStepSwapAggregator);

      if (!withdrawQuote || !swapQuotes.length) {
        throw new Error('Invalid quote steps');
      }

      // Step 1. Withdraw from vault
      const vaultWithdraw = await this.vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
      });
      if (vaultWithdraw.outputs.length !== 1) {
        throw new Error('Withdraw output count mismatch');
      }
      const withdrawOutput = first(vaultWithdraw.outputs)!;
      if (!isTokenEqual(withdrawOutput.token, swapQuotes[0].fromToken)) {
        throw new Error('Withdraw output token mismatch');
      }
      if (withdrawOutput.amount.lt(withdrawQuote.toAmount)) {
        throw new Error('Withdraw output amount mismatch');
      }

      const steps: ZapStep[] = [vaultWithdraw.zap];

      // Step 2. Swaps
      const swapZaps = await Promise.all(
        swapQuotes.map(quoteStep => this.fetchZapSwapAggregator(quoteStep, zapHelpers, true))
      );
      swapZaps.forEach(swap => swap.zaps.forEach(step => steps.push(step)));

      // Build order (note: input to order is shares, but quote inputs are the deposit token)
      const inputs: OrderInput[] = vaultWithdraw.inputs.map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      // The required output is the swap output
      const requiredOutputs: OrderOutput[] = quote.outputs.map(output => ({
        token: getTokenAddress(output.token),
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
      const dustOutputs: OrderOutput[] = pickTokens(
        vaultWithdraw.inputs,
        quote.outputs,
        quote.inputs,
        quote.returned
      ).map(token => ({
        token: getTokenAddress(token),
        minOutputAmount: '0',
      }));

      swapQuotes.forEach(quoteStep => {
        dustOutputs.push({
          token: getTokenAddress(quoteStep.fromToken),
          minOutputAmount: '0',
        });
        dustOutputs.push({
          token: getTokenAddress(quoteStep.toToken),
          minOutputAmount: '0',
        });
      });

      // @dev uniqBy: first occurrence of each element is kept.
      const outputs = uniqBy(requiredOutputs.concat(dustOutputs), output => output.token);

      // Perform TX
      const zapRequest: UserlessZapRequest = {
        order: {
          inputs,
          outputs,
          relay: NO_RELAY,
        },
        steps,
      };

      const expectedTokens = quote.outputs.map(output => output.token);
      const walletAction = walletActions.zapExecuteOrder(
        quote.option.vaultId,
        zapRequest,
        expectedTokens
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

  protected async fetchZapSwapAggregator(
    quoteStep: ZapQuoteStepSwapAggregator,
    zapHelpers: ZapHelpers,
    insertBalance: boolean
  ): Promise<ZapStepResponse> {
    const { swapAggregator, zap } = this.helpers;
    const { slippage, state } = zapHelpers;

    return await fetchZapAggregatorSwap(
      {
        quote: quoteStep.quote,
        inputs: [{ token: quoteStep.fromToken, amount: quoteStep.fromAmount }],
        outputs: [{ token: quoteStep.toToken, amount: quoteStep.toAmount }],
        maxSlippage: slippage,
        zapRouter: zap.router,
        providerId: quoteStep.providerId,
        insertBalance,
      },
      swapAggregator,
      state
    );
  }
}
