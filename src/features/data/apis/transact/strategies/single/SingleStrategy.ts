import { first, uniqBy } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { BIG_ZERO, fromWei, toWeiString } from '../../../../../../helpers/big-number.ts';
import { zapExecuteOrder } from '../../../../actions/wallet/zap.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token.ts';
import {
  isErc4626AsyncWithdrawVault,
  isErc4626Vault,
  isStandardVault,
  type VaultErc4626,
  type VaultStandard,
} from '../../../../entities/vault.ts';
import type { Step } from '../../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../../selectors/chains.ts';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
} from '../../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../../selectors/transact.ts';
import type { BeefyState, BeefyThunk } from '../../../../store/types.ts';
import { slipBy } from '../../helpers/amounts.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyAssetCount,
  onlyOneInput,
  onlyOneToken,
} from '../../helpers/options.ts';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes.ts';
import { nativeAndWrappedAreSame, pickTokens } from '../../helpers/tokens.ts';
import { getVaultWithdrawnFromState } from '../../helpers/vault.ts';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap.ts';
import {
  type InputTokenAmount,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  isZapQuoteStepWithdraw,
  SelectionOrder,
  type SingleDepositOption,
  type SingleDepositQuote,
  type SingleWithdrawOption,
  type SingleWithdrawQuote,
  type TokenAmount,
  type TransactQuote,
  type ZapFee,
  type ZapQuoteStep,
  type ZapQuoteStepSwapAggregator,
} from '../../transact-types.ts';
import {
  type IErc4626VaultType,
  isErc4626VaultType,
  isStandardVaultType,
  type IStandardVaultType,
} from '../../vaults/IVaultType.ts';
import { fetchZapAggregatorSwap } from '../../zap/swap.ts';
import type {
  OrderInput,
  OrderOutput,
  UserlessZapRequest,
  ZapStep,
  ZapStepResponse,
} from '../../zap/types.ts';
import type {
  IComposableStrategy,
  IComposableStrategyStatic,
  UserlessZapDepositBreakdown,
  UserlessZapWithdrawBreakdown,
  ZapTransactHelpers,
} from '../IStrategy.ts';
import type { SingleStrategyConfig } from '../strategy-configs.ts';

type ZapHelpers = {
  chain: ChainEntity;
  slippage: number;
  state: BeefyState;
};

const strategyId = 'single';
type StrategyId = typeof strategyId;

class SingleStrategyImpl implements IComposableStrategy<StrategyId> {
  public static readonly id = strategyId;
  public static readonly composable: true;
  public readonly id = strategyId;

  protected readonly wnative: TokenErc20;
  protected readonly native: TokenNative;
  protected readonly vault: VaultStandard | VaultErc4626;
  protected readonly vaultType: IStandardVaultType | IErc4626VaultType;

  public getHelpers(): ZapTransactHelpers {
    return this.helpers;
  }

  constructor(
    protected options: SingleStrategyConfig,
    protected helpers: ZapTransactHelpers
  ) {
    // Make sure zap was configured correctly for this vault
    const { vault, vaultType, getState } = this.helpers;

    if (!isStandardVault(vault) && !isErc4626Vault(vault)) {
      throw new Error('Vault is not a standard/erc4626 vault');
    }
    if (!isStandardVaultType(vaultType) && !isErc4626VaultType(vaultType)) {
      throw new Error('Vault type is not standard/erc4626');
    }

    onlyAssetCount(vault, 1);

    // configure
    const state = getState();
    this.vault = vault;
    this.vaultType = vaultType;
    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
  }

  isDepositDisabled(): boolean {
    return !!this.options.disableDeposit;
  }

  isWithdrawDisabled(): boolean {
    return !!this.options.disableWithdraw || isErc4626AsyncWithdrawVault(this.vault);
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
    if (this.isDepositDisabled()) {
      return [];
    }

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
        selectionOrder: SelectionOrder.Other,
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
    if (this.isDepositDisabled()) {
      throw new Error('Deposit zap is disabled');
    }

    const { swapAggregator, zap, getState } = this.helpers;

    // Input
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    // Token Allowances
    const allowances =
      isTokenErc20(input.token) ?
        [
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
      state,
      this.options.swap
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
    if (this.isDepositDisabled()) {
      throw new Error('Deposit zap is disabled');
    }

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
        from: this.helpers.zap.router,
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

  async fetchWithdrawOptions(): Promise<SingleWithdrawOption[]> {
    if (this.isWithdrawDisabled()) {
      return [];
    }

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
        selectionOrder: SelectionOrder.Other,
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
    if (this.isWithdrawDisabled()) {
      throw new Error('Withdraw zap is disabled');
    }

    const { swapAggregator, zap, getState } = this.helpers;
    const vault = this.vault;
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
        state,
        this.options.swap
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
        state,
        this.options.swap
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
    if (this.isWithdrawDisabled()) {
      throw new Error('Withdraw zap is disabled');
    }

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
        from: this.helpers.zap.router,
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

  fetchDepositUserlessZapBreakdown(_quote: TransactQuote): Promise<UserlessZapDepositBreakdown> {
    throw new Error('no impl');
  }

  fetchWithdrawUserlessZapBreakdown(_quote: TransactQuote): Promise<UserlessZapWithdrawBreakdown> {
    throw new Error('no impl');
  }
}

export const SingleStrategy = SingleStrategyImpl satisfies IComposableStrategyStatic<StrategyId>;
