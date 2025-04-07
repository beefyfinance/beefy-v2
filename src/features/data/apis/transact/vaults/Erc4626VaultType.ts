// @ts-nocheck FIXME beSonic
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  isErc4626AsyncWithdrawVault,
  isErc4626Vault,
  type VaultErc4626,
} from '../../../entities/vault.ts';
import type { BeefyState, BeefyStateFn } from '../../../../../redux-types.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import type {
  IErc4626VaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType.ts';
import {
  isTokenEqual,
  isTokenErc20,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../../entities/token.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyOneInput,
} from '../helpers/options.ts';
import {
  type AllowanceTokenAmount,
  type Erc4626VaultDepositOption,
  type Erc4626VaultDepositQuote,
  type Erc4626VaultWithdrawOption,
  type Erc4626VaultWithdrawQuote,
  type InputTokenAmount,
  SelectionOrder,
  type TokenAmount,
  type TransactQuote,
} from '../transact-types.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import { first } from 'lodash-es';
import { BIG_ZERO, fromWei } from '../../../../../helpers/big-number.ts';
import { selectFeesByVaultId } from '../../../selectors/fees.ts';
import { BigNumber } from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../reducers/wallet/stepper.ts';
import { getVaultWithdrawnFromState } from '../helpers/vault.ts';
import type { ZapStep } from '../zap/types.ts';
import { deposit, requestRedeem } from '../../../actions/wallet/erc4626.ts';

export class Erc4626VaultType implements IErc4626VaultType {
  public readonly id = 'erc4626';
  public readonly vault: VaultErc4626;
  public readonly depositToken: TokenEntity;
  public readonly shareToken: TokenErc20;
  protected readonly getState: BeefyStateFn;

  constructor(vault: VaultErc4626, getState: BeefyStateFn) {
    if (!isErc4626Vault(vault)) {
      throw new Error('Vault is not a erc4626 vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);

    const shareToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
    if (!isTokenErc20(shareToken)) {
      throw new Error('Share token is not an ERC20 token');
    }
    this.shareToken = shareToken;
  }

  protected calculateDepositFee(input: TokenAmount, state: BeefyState): BigNumber {
    const fees = selectFeesByVaultId(state, this.vault.id);
    const depositFeePercent = fees?.deposit || 0;
    return depositFeePercent > 0
      ? input.amount
          .multipliedBy(depositFeePercent)
          .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
      : BIG_ZERO;
  }

  async fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse> {
    throw new Error('Not implemented');
  }

  protected fetchErc20ZapDeposit(
    vaultAddress: string,
    depositToken: TokenErc20,
    depositAmount: BigNumber,
    depositAll: boolean
  ): ZapStep {
    throw new Error('Not implemented');
  }

  protected fetchNativeZapDeposit(
    vaultAddress: string,
    depositToken: TokenNative,
    depositAmount: BigNumber
  ): ZapStep {
    throw new Error('Not implemented');
  }

  async fetchDepositOption(): Promise<Erc4626VaultDepositOption> {
    const inputs = [this.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return {
      id: createOptionId('vault-erc4626', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: SelectionOrder.Want,
      selectionHideIfZeroBalance: false,
      inputs,
      wantedOutputs: inputs,
      strategyId: 'vault',
      vaultType: 'erc4626',
      async: false,
      mode: TransactMode.Deposit,
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: Erc4626VaultDepositOption
  ): Promise<Erc4626VaultDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Quote called with invalid input token');
    }

    if (!isTokenErc20(input.token)) {
      throw new Error('Quote called with invalid input token type');
    }

    const state = this.getState();
    const fee = this.calculateDepositFee(input, state);
    const output = {
      token: input.token,
      amount: input.amount.minus(fee),
    };
    const allowances = [
      {
        token: input.token,
        amount: input.amount,
        spenderAddress: this.vault.contractAddress,
      },
    ];

    return {
      id: createQuoteId(option.id),
      strategyId: option.strategyId,
      vaultType: option.vaultType,
      option,
      inputs,
      outputs: [output],
      returned: [],
      allowances,
      priceImpact: 0,
    };
  }

  async fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step> {
    onlyInputCount(quote.inputs, 1);

    const input = first(quote.inputs)!; // we checked length above

    return {
      step: 'deposit',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: deposit(this.vault, input.amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawOption(): Promise<Erc4626VaultWithdrawOption> {
    const inputs = [this.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return {
      id: createOptionId('vault-erc4626', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: SelectionOrder.Want,
      inputs,
      wantedOutputs: inputs,
      strategyId: 'vault',
      vaultType: 'erc4626',
      async: isErc4626AsyncWithdrawVault(this.vault),
      mode: TransactMode.Withdraw,
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: Erc4626VaultWithdrawOption
  ): Promise<Erc4626VaultWithdrawQuote> {
    const input = onlyOneInput(inputs);

    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Quote called with invalid input token');
    }

    if (!isTokenErc20(input.token)) {
      throw new Error('Quote called with invalid input token type');
    }

    const state = this.getState();
    const { withdrawnAmountAfterFeeWei } = getVaultWithdrawnFromState(input, this.vault, state);
    const outputs = [
      {
        token: input.token,
        amount: fromWei(withdrawnAmountAfterFeeWei, input.token.decimals),
      },
    ];
    const allowances: AllowanceTokenAmount[] = [];

    return {
      id: createQuoteId(option.id),
      strategyId: option.strategyId,
      vaultType: option.vaultType,
      option,
      inputs,
      outputs,
      returned: [],
      allowances,
      priceImpact: 0,
    };
  }

  async fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step> {
    onlyInputCount(quote.inputs, 1);
    const input = first(quote.inputs)!; // we checked length above

    if (isErc4626AsyncWithdrawVault(this.vault)) {
      return {
        step: 'request-withdraw',
        message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
        action: requestRedeem(this.vault, input.amount, input.max),
        pending: false,
        extraInfo: { zap: false, vaultId: quote.option.vaultId },
      };
    }

    throw new Error('Sync withdraw not implemented');
  }

  async fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    throw new Error('Not implemented');
  }

  protected fetchNativeZapWithdraw(
    vaultAddress: string,
    shareToken: TokenErc20,
    sharesToWithdrawWei: BigNumber,
    withdrawAll: boolean
  ): ZapStep {
    throw new Error('Not implemented');
  }

  protected fetchErc20ZapWithdraw(
    vaultAddress: string,
    shareToken: TokenErc20,
    sharesToWithdrawWei: BigNumber,
    withdrawAll: boolean
  ): ZapStep {
    throw new Error('Not implemented');
  }
}
