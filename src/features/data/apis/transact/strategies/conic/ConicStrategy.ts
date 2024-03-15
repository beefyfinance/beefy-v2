import type { IStrategy, SingleStrategyOptions, ZapTransactHelpers } from '../IStrategy';
import type {
  ConicDepositOption,
  ConicDepositQuote,
  ConicWithdrawOption,
  ConicWithdrawQuote,
  InputTokenAmount,
  TokenAmount,
  ZapQuoteStep,
} from '../../transact-types';
import {
  isTokenErc20,
  isTokenNative,
  type TokenEntity,
  type TokenErc20,
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
import { nativeToWNative, pickTokens } from '../../helpers/tokens';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { walletActions } from '../../../../actions/wallet-actions';
import { getTokenAddress, NO_RELAY } from '../../helpers/zap';
import type { OrderInput, OrderOutput, UserlessZapRequest, ZapStep } from '../../zap/types';
import { uniqBy } from 'lodash-es';
import { slipBy } from '../../helpers/amounts';
import coder from 'web3-eth-abi';

export class ConicStrategy implements IStrategy {
  readonly id: string = 'conic';
  protected readonly conicZap = '0x1F3aabF169aE52E868a6065CD1AE6B29Ae1a0368';
  protected readonly tokens: TokenEntity[];
  protected readonly cnc: TokenErc20;

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

    this.tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    this.cnc = selectErc20TokenByAddress(
      state,
      vault.chainId,
      '0x9aE380F0272E2162340a5bB646c354271c0F5cFC'
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
    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const zapTokenIn = nativeToWNative(input.token, wnative);
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
    const { vault, zap, getState } = this.helpers;
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
    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const zapDesiredToken = nativeToWNative(desiredToken, wnative);
    const estimate = await zapContract.methods
      .estimateSwapOut(
        vault.earnContractAddress,
        zapDesiredToken.address,
        sharesToWithdrawWei.toString(10)
      )
      .call();
    const swapAmountOut = fromWeiString(estimate.swapAmountOut, desiredToken.decimals);
    const outputs: TokenAmount[] = [{ token: desiredToken, amount: swapAmountOut }];
    const returned: TokenAmount[] = [];

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
        outputs,
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
      fee: ZERO_FEE,
    };
  }

  async fetchWithdrawStep(quote: ConicWithdrawQuote, t: TFunction<Namespace>): Promise<Step> {
    const { vault } = this.helpers;
    const zapAction: BeefyThunk = async (dispatch, getState, extraArgument) => {
      const state = getState();
      const slippage = selectTransactSlippage(state);

      const input = onlyOneInput(quote.inputs);
      const output = onlyOneTokenAmount(quote.outputs);
      const withdrawAmount = toWeiString(input.amount, input.token.decimals);
      const amountOutMin = toWeiString(
        slipBy(output.amount, slippage, output.token.decimals),
        output.token.decimals
      );

      const steps: ZapStep[] = [
        {
          target: this.conicZap,
          value: '0',
          data: this.encodeBeefOutAndSwap(
            vault.earnContractAddress,
            withdrawAmount,
            output.token.address,
            amountOutMin
          ),
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

      // The required output is the swap output
      const requiredOutputs: OrderOutput[] = quote.outputs.map(output => ({
        token: getTokenAddress(output.token),
        minOutputAmount: toWeiString(
          slipBy(output.amount, slippage, output.token.decimals),
          output.token.decimals
        ),
      }));

      // CNC is rewarded by Conic if deposit rebalanced pool
      const CNC = { token: this.cnc, amount: BIG_ZERO };
      // We need to list all inputs, and mid-route outputs, as outputs so dust gets returned
      const dustOutputs: OrderOutput[] = pickTokens(
        [CNC],
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
