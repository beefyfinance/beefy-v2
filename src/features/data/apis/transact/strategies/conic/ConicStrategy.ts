import type { IStrategy, SingleStrategyOptions, ZapTransactHelpers } from '../IStrategy';
import {
  type ConicDepositOption,
  type ConicDepositQuote,
  type ConicWithdrawOption,
  type ConicWithdrawQuote,
  type InputTokenAmount,
  isZapQuoteStepSwap,
  isZapQuoteStepSwapAggregator,
  type TokenAmount,
  type ZapQuoteStep,
} from '../../transact-types';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../../../entities/token';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyAssetCount,
  onlyOneInput,
  onlyOneToken,
  onlyOneTokenAmount,
  onlyVaultStandard,
} from '../../helpers/options';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import {
  selectChainNativeToken,
  selectChainWrappedNativeToken,
  selectErc20TokenByAddress,
  selectIsTokenLoaded,
  selectTokenByAddress,
  selectTokenById,
} from '../../../../selectors/tokens';
import type { Step } from '../../../../reducers/wallet/stepper';
import {
  BIG_ZERO,
  fromWei,
  fromWeiString,
  toWeiString,
} from '../../../../../../helpers/big-number';
import { getWeb3Instance } from '../../../instances';
import { selectChainById } from '../../../../selectors/chains';
import type { Namespace, TFunction } from 'react-i18next';
import type { BeefyThunk } from '../../../../../../redux-types';
import { calculatePriceImpact, ZERO_FEE } from '../../helpers/quotes';
import { isStandardVault } from '../../../../entities/vault';
import { getVaultWithdrawnFromState } from '../../helpers/vault';
import ZapAbi from '../../../../../../config/abi/zap.json';
import type { AbiItem } from 'web3-utils';
import {
  includeNativeAndWrapped,
  nativeAndWrappedAreSame,
  nativeToWNative,
  pickTokens,
  wnativeToNative,
} from '../../helpers/tokens';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { walletActions } from '../../../../actions/wallet-actions';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap';
import type { OrderInput, OrderOutput, UserlessZapRequest, ZapStep } from '../../zap/types';
import { first, uniqBy } from 'lodash-es';
import { slipBy } from '../../helpers/amounts';
import coder from 'web3-eth-abi';
import { fetchZapAggregatorSwap } from '../../zap/swap';

export class ConicStrategy implements IStrategy {
  readonly id: string = 'conic';
  protected readonly conicZap = '0x1F3aabF169aE52E868a6065CD1AE6B29Ae1a0368';
  protected readonly tokens: TokenEntity[];
  protected readonly cnc: TokenErc20;
  protected readonly native: TokenNative;
  protected readonly wnative: TokenErc20;

  constructor(protected options: SingleStrategyOptions, protected helpers: ZapTransactHelpers) {
    const { vault, getState } = this.helpers;
    onlyVaultStandard(vault);
    onlyAssetCount(vault, 1);
    const state = getState();
    for (let i = 0; i < vault.assetIds.length; ++i) {
      if (!selectIsTokenLoaded(state, vault.chainId, vault.assetIds[i])) {
        throw new Error(`Vault ${vault.id}: Asset ${vault.assetIds[i]} not loaded`);
      }
    }

    this.native = selectChainNativeToken(state, vault.chainId);
    this.wnative = selectChainWrappedNativeToken(state, vault.chainId);
    this.cnc = selectErc20TokenByAddress(
      state,
      vault.chainId,
      '0x9aE380F0272E2162340a5bB646c354271c0F5cFC'
    );
    // Allow native and wrapped
    this.tokens = includeNativeAndWrapped(
      vault.assetIds.map(id => selectTokenById(state, vault.chainId, id)),
      this.wnative,
      this.native
    );
  }

  async fetchDepositOptions(): Promise<ConicDepositOption[]> {
    const { vault, vaultType } = this.helpers;
    const outputs = [vaultType.depositToken];
    return this.tokens.map(token => {
      const inputs = [token];
      const selectionId = createSelectionId(vault.chainId, inputs);
      return {
        id: createOptionId('conic', vault.id, selectionId),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        strategyId: 'conic',
        mode: TransactMode.Deposit,
      };
    });
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: ConicDepositOption
  ): Promise<ConicDepositQuote> {
    const { vault, vaultType, zap, getState } = this.helpers;
    const state = getState();

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

    const chain = selectChainById(state, vault.chainId);
    const web3 = await getWeb3Instance(chain);
    const zapContract = new web3.eth.Contract(ZapAbi as AbiItem[], this.conicZap);
    const zapTokenIn = nativeToWNative(input.token, this.wnative);
    const userAmountInWei = toWeiString(input.amount, input.token.decimals);
    const estimate = await zapContract.methods
      .estimateSwap(vault.earnContractAddress, zapTokenIn.address, userAmountInWei)
      .call();
    const lpToken = vaultType.depositToken;
    const swapAmountOut = fromWeiString(estimate.swapAmountOut, lpToken.decimals);
    const outputs: TokenAmount[] = [{ token: lpToken, amount: swapAmountOut }];
    const returned: TokenAmount[] = [];

    const steps: ZapQuoteStep[] = [
      {
        type: 'build',
        inputs: [{ token: input.token, amount: input.amount }],
        outputToken: lpToken,
        outputAmount: swapAmountOut,
      },
      {
        type: 'deposit',
        token: vaultType.depositToken,
        amount: swapAmountOut,
      },
    ];

    return {
      id: createQuoteId(option.id),
      strategyId: 'conic',
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: { value: 0 },
    };
  }

  async fetchDepositStep(quote: ConicDepositQuote, t: TFunction<Namespace>): Promise<Step> {
    const { vault } = this.helpers;
    if (!isStandardVault(vault)) {
      throw new Error('Vault is not standard');
    }

    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);

      const input = onlyOneInput(quote.inputs);
      const output = onlyOneTokenAmount(quote.outputs);
      const amountOutMin = toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      );
      const isNative = isTokenNative(input.token);
      const data = isNative
        ? this.encodeBeefInETHCall(vault.earnContractAddress, amountOutMin)
        : this.encodeBeefInCall(
            vault.earnContractAddress,
            amountOutMin,
            getTokenAddress(input.token),
            toWeiString(input.amount, input.token.decimals)
          );
      const steps: ZapStep[] = [
        {
          target: this.conicZap,
          value: isNative ? toWeiString(input.amount, input.token.decimals) : '0',
          data,
          tokens: [
            {
              token: getTokenAddress(input.token),
              index: -1, // not dynamically inserted
            },
          ],
        },
      ];

      // Build order
      const inputs: OrderInput[] = quote.inputs.map(input => ({
        token: getTokenAddress(input.token),
        amount: toWeiString(input.amount, input.token.decimals),
      }));

      const shareToken = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);
      const requiredOutputs: OrderOutput[] = [
        {
          token: getTokenAddress(shareToken),
          minOutputAmount: '0', // Checked in the zap contract
        },
      ];

      // CNC is rewarded by Conic if deposit rebalanced pool
      const CNC = { token: this.cnc, amount: BIG_ZERO };
      // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
      const dustOutputs: OrderOutput[] = quote.outputs
        .concat(quote.inputs)
        .concat([CNC])
        .map(input => ({
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

      const expectedTokens = [shareToken];
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

  async fetchWithdrawOptions(): Promise<ConicWithdrawOption[]> {
    const { vault, vaultType } = this.helpers;
    const inputs = [vaultType.depositToken];

    return this.tokens.map(token => {
      const outputs = [token];
      const selectionId = createSelectionId(vault.chainId, outputs);
      return {
        id: createOptionId('conic', vault.id, selectionId),
        vaultId: vault.id,
        chainId: vault.chainId,
        selectionId,
        selectionOrder: 3,
        inputs,
        wantedOutputs: outputs,
        strategyId: 'conic',
        mode: TransactMode.Withdraw,
      };
    });
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: ConicWithdrawOption
  ): Promise<ConicWithdrawQuote> {
    const { vault, zap, swapAggregator, getState } = this.helpers;
    if (!isStandardVault(vault)) {
      throw new Error('Vault is not standard');
    }

    // Input
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    // Output
    const desiredToken = onlyOneToken(option.wantedOutputs);

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

    const chain = selectChainById(state, vault.chainId);
    const web3 = await getWeb3Instance(chain);
    const zapContract = new web3.eth.Contract(ZapAbi as AbiItem[], this.conicZap);
    const poolOutputToken = nativeToWNative(desiredToken, this.wnative); // pool withdraws are always erc20...
    const customOutputToken = wnativeToNative(desiredToken, this.wnative, this.native); // ...but custom zap unwraps to native

    // Withdraw and split via custom zap contract
    const estimate = await zapContract.methods
      .estimateSwapOut(
        vault.earnContractAddress,
        poolOutputToken.address,
        sharesToWithdrawWei.toString(10)
      )
      .call();
    const swapAmountOut = fromWeiString(estimate.swapAmountOut, desiredToken.decimals);

    const steps: ZapQuoteStep[] = [
      {
        type: 'withdraw',
        token: withdrawnToken,
        amount: withdrawnAmountAfterFee,
      },
      {
        type: 'split',
        inputToken: withdrawnToken,
        inputAmount: withdrawnAmountAfterFee,
        outputs: [{ token: customOutputToken, amount: swapAmountOut }],
      },
    ];

    // Wrap if needed
    if (
      isTokenEqual(desiredToken, this.wnative) &&
      isTokenEqual(customOutputToken, this.native) &&
      !nativeAndWrappedAreSame(desiredToken.chainId)
    ) {
      const unwrapQuotes = await swapAggregator.fetchQuotes(
        {
          fromAmount: swapAmountOut,
          fromToken: customOutputToken,
          toToken: desiredToken,
          vaultId: vault.id,
        },
        state
      );
      const unwrapQuote = first(unwrapQuotes);
      if (!unwrapQuote || unwrapQuote.toAmount.lt(swapAmountOut)) {
        throw new Error('No unwrap quote found');
      }

      steps.push({
        type: 'swap',
        fromToken: unwrapQuote.fromToken,
        fromAmount: unwrapQuote.fromAmount,
        toToken: unwrapQuote.toToken,
        toAmount: unwrapQuote.toAmount,
        via: 'aggregator',
        providerId: unwrapQuote.providerId,
        fee: unwrapQuote.fee,
        quote: unwrapQuote,
      });
    }

    const outputs: TokenAmount[] = [{ token: desiredToken, amount: swapAmountOut }];
    const returned: TokenAmount[] = [];

    return {
      id: createQuoteId(option.id),
      strategyId: 'conic',
      priceImpact: calculatePriceImpact(inputs, outputs, returned, state),
      option,
      inputs,
      outputs,
      returned,
      allowances,
      steps,
      fee: ZERO_FEE,
    };
  }

  async fetchWithdrawStep(quote: ConicWithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    const { vault, swapAggregator, zap, vaultType } = this.helpers;
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);
      const output = onlyOneTokenAmount(quote.outputs);
      const swapQuotes = quote.steps
        .filter(isZapQuoteStepSwap)
        .filter(isZapQuoteStepSwapAggregator);
      // CNC is rewarded by Conic if deposit rebalanced pool
      const extraDustOutputs: TokenAmount[] = [{ token: this.cnc, amount: BIG_ZERO }];

      // Pretend to withdraw from vault, to get the correct number of shares
      const vaultWithdraw = await vaultType.fetchZapWithdraw({
        inputs: quote.inputs,
      });
      const sharesToWithdraw = onlyOneTokenAmount(vaultWithdraw.inputs);

      // Step 1. Withdraw and split via custom zap contract
      const sharesToWithdrawWei = toWeiString(
        sharesToWithdraw.amount,
        sharesToWithdraw.token.decimals
      );
      const amountOutMinWei = toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      );
      const zapOutTokenAddress = nativeToWNative(output.token, this.wnative).address;

      const steps: ZapStep[] = [
        {
          target: this.conicZap,
          value: '0',
          data: this.encodeBeefOutAndSwap(
            vault.earnContractAddress,
            sharesToWithdrawWei,
            zapOutTokenAddress,
            amountOutMinWei
          ),
          tokens: [
            {
              token: getTokenAddress(sharesToWithdraw.token),
              index: -1, // not dynamically inserted
            },
          ],
        },
      ];

      // Step 2. Wrap if needed
      if (swapQuotes.length > 0) {
        if (swapQuotes.length > 1) {
          throw new Error('Invalid swap quote');
        }
        const swapQuoteStep = swapQuotes[0];
        if (
          !isTokenEqual(swapQuoteStep.quote.fromToken, this.native) ||
          !isTokenEqual(swapQuoteStep.quote.toToken, this.wnative)
        ) {
          // @dev changes required to support general token swaps
          throw new Error('Only native swap implemented');
        }

        const swapZapStep = await fetchZapAggregatorSwap(
          {
            quote: swapQuoteStep.quote,
            inputs: [{ token: swapQuoteStep.fromToken, amount: swapQuoteStep.fromAmount }],
            outputs: [{ token: swapQuoteStep.toToken, amount: swapQuoteStep.toAmount }],
            maxSlippage: slippage,
            zapRouter: zap.router,
            providerId: swapQuoteStep.providerId,
            insertBalance: true,
          },
          swapAggregator,
          state
        );
        swapZapStep.zaps.forEach(step => steps.push(step));
        extraDustOutputs.push({ token: swapQuoteStep.quote.fromToken, amount: BIG_ZERO });
      }

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
        extraDustOutputs,
        vaultWithdraw.inputs,
        quote.inputs,
        quote.outputs,
        quote.returned
      ).map(token => ({
        token: getTokenAddress(token),
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

  private encodeBeefInCall(
    vault: string,
    tokenAmountOutMin: string,
    tokenIn: string,
    amountWei: string
  ): string {
    return coder.encodeFunctionCall(ZapAbi.find(item => item.name === 'beefIn') as AbiItem, [
      vault,
      tokenAmountOutMin,
      tokenIn,
      amountWei,
    ]);
  }

  private encodeBeefInETHCall(vault: string, tokenAmountOutMin: string): string {
    return coder.encodeFunctionCall(ZapAbi.find(item => item.name === 'beefInETH') as AbiItem, [
      vault,
      tokenAmountOutMin,
    ]);
  }

  private encodeBeefOutAndSwap(
    vault: string,
    withdrawAmount: string,
    desiredToken: string,
    desiredTokenOutMin: string
  ): string {
    return coder.encodeFunctionCall(
      ZapAbi.find(item => item.name === 'beefOutAndSwap') as AbiItem,
      [vault, withdrawAmount, desiredToken, desiredTokenOutMin]
    );
  }
}
