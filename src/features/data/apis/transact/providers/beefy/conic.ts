import type {
  InputTokenAmount,
  ITransactProvider,
  TransactOption,
  ZapFee,
  ZapOption,
  ZapQuote,
  ZapQuoteStepBuild,
  ZapQuoteStepSplit,
  ZapQuoteStepSwap,
} from '../../transact-types';
import type { VaultEntity } from '../../../../entities/vault';
import { isStandardVault } from '../../../../entities/vault';
import type { BeefyState } from '../../../../../../redux-types';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper';
import { selectStandardVaultById, selectVaultById } from '../../../../selectors/vaults';
import {
  selectChainWrappedNativeToken,
  selectTokenByAddress,
  selectTokenById,
} from '../../../../selectors/tokens';
import type { TokenErc20 } from '../../../../entities/token';
import { isTokenErc20, isTokenNative } from '../../../../entities/token';
import { createOptionId, createQuoteId, createTokensId } from '../../utils';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import type { BeefyZapOption } from './base';
import { selectBeefyZapByAmmId } from '../../../../selectors/zap';
import { first } from 'lodash-es';
import { BIG_ZERO, fromWei, fromWeiString, toWei } from '../../../../../../helpers/big-number';
import { nativeToWNative } from '../../helpers/tokens';
import { selectTransactSlippage } from '../../../../selectors/transact';
import { walletActions } from '../../../../actions/wallet-actions';
import { getVaultWithdrawnFromState } from '../../helpers/vault';
import { ZapAbi } from '../../../../../../config/abi';
import { selectChainById } from '../../../../selectors/chains';
import { getWeb3Instance } from '../../../instances';

const ZERO_FEE: ZapFee = { value: 0 };

export class ConicZapProvider implements ITransactProvider {
  private ammId = 'ethereum-conic';
  private tokenProviderId = 'conic';
  private depositCache: Record<string, BeefyZapOption[]> = {};
  private withdrawCache: Record<string, BeefyZapOption[]> = {};

  getId(): string {
    return 'beefy-zap-conic';
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<ZapOption[] | null> {
    if (vaultId in this.depositCache) {
      return this.depositCache[vaultId];
    }

    const option = this.getCommonOption(vaultId, state, TransactMode.Deposit);
    if (!option) return null;

    this.depositCache[vaultId] = [option];
    return this.depositCache[vaultId];
  }

  async getDepositQuoteFor(
    option: ZapOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<ZapQuote | null> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    if (!isStandardVault(vault)) {
      throw new Error(`Only standard vaults are supported`);
    }

    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    if (userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    const chain = selectChainById(state, option.chainId);
    const web3 = await getWeb3Instance(chain);
    const zapContract = new web3.eth.Contract(ZapAbi, option.zap.zapAddress);

    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const zapTokenIn = nativeToWNative(userInput.token, wnative);
    const userAmountInWei = toWei(userInput.amount, userInput.token.decimals);
    const estimate = await zapContract.methods
      .estimateSwap(vault.earnContractAddress, zapTokenIn.address, userAmountInWei.toString(10))
      .call();

    const lpToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const swapAmountOut = fromWeiString(estimate.swapAmountOut, lpToken.decimals);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      allowances: amounts
        .filter(tokenAmount => isTokenErc20(tokenAmount.token))
        .map(tokenAmount => ({
          token: tokenAmount.token as TokenErc20,
          amount: tokenAmount.amount,
          spenderAddress: option.zap.zapAddress,
        })),
      inputs: amounts,
      outputs: [
        {
          token: lpToken,
          amount: swapAmountOut,
        },
      ],
      priceImpact: 0,
      steps: [
        {
          type: 'build',
          inputs: [
            {
              token: userInput.token,
              amount: userInput.amount,
            },
          ],
          outputToken: lpToken,
          outputAmount: swapAmountOut,
        },
        {
          type: 'deposit',
          token: lpToken,
          amount: swapAmountOut,
        },
      ],
    };
  }

  async getDepositStep(
    quote: ZapQuote,
    option: ZapOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    const slippage = selectTransactSlippage(state);
    const input = quote.inputs[0];
    const isNativeInput = isTokenNative(input.token);

    const build = quote.steps.find(step => step.type === 'build') as ZapQuoteStepBuild;
    if (!build) {
      throw new Error(`No build step in zap quote`);
    }
    const swap: ZapQuoteStepSwap = {
      type: 'swap',
      fromToken: build.inputs[0].token as TokenErc20,
      fromAmount: build.inputs[0].amount,
      toToken: build.outputToken as TokenErc20,
      toAmount: build.outputAmount,
      priceImpact: 0,
    };

    return {
      step: 'zap-in',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.beefIn(vault, input.amount, isNativeInput, swap, option.zap, slippage),
      pending: false,
      extraInfo: { zap: true, vaultId: vault.id },
    };
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    if (vaultId in this.withdrawCache) {
      return this.withdrawCache[vaultId];
    }

    const option = this.getCommonOption(vaultId, state, TransactMode.Withdraw);
    if (!option) return null;

    this.withdrawCache[vaultId] = [option];
    return this.withdrawCache[vaultId];
  }

  async getWithdrawQuoteFor(
    option: ZapOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<ZapQuote | null> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    if (!isStandardVault(vault)) {
      throw new Error(`Only standard vaults are supported`);
    }

    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    if (userInput.amount.lte(BIG_ZERO)) {
      throw new Error(`Quote called with 0 input`);
    }

    const desiredToken = selectTokenByAddress(state, option.chainId, option.tokenAddresses[0]);
    const wnative = selectChainWrappedNativeToken(state, vault.chainId);
    const zapDesiredToken = nativeToWNative(desiredToken, wnative);
    const { shareToken, sharesToWithdrawWei } = getVaultWithdrawnFromState(userInput, vault, state);

    const chain = selectChainById(state, option.chainId);
    const web3 = await getWeb3Instance(chain);
    const zapContract = new web3.eth.Contract(ZapAbi, option.zap.zapAddress);
    const estimate = await zapContract.methods
      .estimateSwapOut(
        vault.earnContractAddress,
        zapDesiredToken.address,
        sharesToWithdrawWei.toString(10)
      )
      .call();

    const lpToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const swapAmountIn = fromWeiString(estimate.swapAmountIn, lpToken.decimals);
    const swapAmountOut = fromWeiString(estimate.swapAmountOut, desiredToken.decimals);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'zap',
      allowances: [
        {
          token: shareToken,
          amount: fromWei(sharesToWithdrawWei, shareToken.decimals),
          spenderAddress: option.zap.zapAddress,
        },
      ],
      inputs: amounts,
      outputs: [
        {
          token: desiredToken,
          amount: swapAmountOut,
        },
      ],
      priceImpact: 0,
      steps: [
        {
          type: 'split',
          inputToken: lpToken,
          inputAmount: swapAmountIn,
          outputs: [
            {
              token: desiredToken,
              amount: swapAmountOut,
            },
          ],
        },
      ],
    };
  }

  async getWithdrawStep(
    quote: ZapQuote,
    option: ZapOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (!this.isBeefyZapOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectStandardVaultById(state, option.vaultId);
    const slippage = selectTransactSlippage(state);

    const split = quote.steps.find(step => step.type === 'split') as ZapQuoteStepSplit;
    if (!split) {
      throw new Error(`No split step in zap quote`);
    }
    const swap: ZapQuoteStepSwap = {
      type: 'swap',
      fromToken: split.inputToken as TokenErc20,
      fromAmount: split.inputAmount,
      toToken: split.outputs[0].token as TokenErc20,
      toAmount: split.outputs[0].amount,
      priceImpact: 0,
    };

    return {
      step: 'zap-out',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.beefOutAndSwap(vault, quote.inputs[0], swap, option.zap, slippage),
      pending: false,
      extraInfo: { zap: true, vaultId: vault.id },
    };
  }

  getCommonOption(
    vaultId: VaultEntity['id'],
    state: BeefyState,
    transactMode: TransactMode
  ): BeefyZapOption {
    const vault = selectVaultById(state, vaultId);
    if (!isStandardVault(vault)) {
      return null;
    }

    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    if (!isTokenErc20(depositToken)) {
      return null;
    }
    if (depositToken.providerId != this.tokenProviderId) {
      return null;
    }

    const zap = selectBeefyZapByAmmId(state, this.ammId);
    if (!zap) {
      return null;
    }

    const tokens = vault.assetIds.map(id => selectTokenById(state, vault.chainId, id));
    if (tokens.length != 1) {
      return null;
    }
    const tokenAddresses = [tokens[0].address.toLowerCase()];

    return {
      id: createOptionId(this.getId(), vaultId, vault.chainId, tokenAddresses),
      type: 'zap',
      mode: transactMode,
      providerId: this.getId(),
      vaultId: vaultId,
      chainId: vault.chainId,
      tokensId: createTokensId(vault.chainId, tokenAddresses),
      tokenAddresses,
      zap,
      amm: undefined,
      lpTokens: [],
      fee: ZERO_FEE,
    };
  }

  isBeefyZapOption(option: ZapOption): option is BeefyZapOption {
    return option.providerId === this.getId();
  }
}
