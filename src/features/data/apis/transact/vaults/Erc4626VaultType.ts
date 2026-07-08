import type BigNumber from 'bignumber.js';
import { first } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { encodeFunctionData, getAddress } from 'viem';
import { Erc4626VaultAbi } from '../../../../../config/abi/Erc4626VaultAbi.ts';
import { BIG_ZERO, toWeiBigInt } from '../../../../../helpers/big-number.ts';
import { deposit, requestRedeem } from '../../../actions/wallet/erc4626.ts';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenErc20,
} from '../../../entities/token.ts';
import {
  isErc4626AsyncWithdrawVault,
  isErc4626Vault,
  type VaultErc4626,
} from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import type { BeefyStateFn } from '../../../store/types.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyOneInput,
  onlyVaultShareInput,
} from '../helpers/options.ts';
import { getInsertIndex, getTokenAddress } from '../helpers/zap.ts';
import {
  type AllowanceTokenAmount,
  type Erc4626VaultDepositOption,
  type Erc4626VaultDepositQuote,
  type Erc4626VaultWithdrawOption,
  type Erc4626VaultWithdrawQuote,
  type InputTokenAmount,
  SelectionOrder,
  type TransactQuote,
} from '../transact-types.ts';
import type { ZapStep } from '../zap/types.ts';
import { PpfsVaultType } from './PpfsVaultType.ts';
import type {
  IErc4626VaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType.ts';

export class Erc4626VaultType extends PpfsVaultType<VaultErc4626> implements IErc4626VaultType {
  public readonly id = 'erc4626';

  constructor(vault: VaultErc4626, getState: BeefyStateFn) {
    if (!isErc4626Vault(vault)) {
      throw new Error('Vault is not a erc4626 vault');
    }
    super(vault, getState);
  }

  async fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse> {
    onlyInputCount(request.inputs, 1);

    const input = first(request.inputs)!; // we checked length above
    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Input token is not the deposit token');
    }
    if (isTokenNative(input.token)) {
      throw new Error('ERC4626 does not support native token deposits');
    }

    const outputs = [await this.resolveDepositLive(input)];

    return {
      inputs: request.inputs,
      outputs,
      minOutputs: outputs,
      zap: this.fetchErc20ZapDeposit(
        this.vault.contractAddress,
        request.from,
        input.token,
        input.amount,
        input.max
      ),
    };
  }

  protected fetchErc20ZapDeposit(
    vaultAddress: string,
    fromAddress: string,
    depositToken: TokenErc20,
    depositAmount: BigNumber,
    _depositAll: boolean
  ): ZapStep {
    return {
      target: vaultAddress,
      value: '0',
      data: encodeFunctionData({
        abi: Erc4626VaultAbi,
        functionName: 'deposit',
        args: [toWeiBigInt(depositAmount, depositToken.decimals), getAddress(fromAddress)],
      }),
      tokens: [
        {
          token: getTokenAddress(depositToken),
          index: getInsertIndex(0),
        },
      ],
    };
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
      wantedOutputs: [this.shareToken],
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

    const output = this.estimateDepositShares(input);
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
      step: 'deposit-erc4626',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: deposit(this.vault, input.amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawOption(): Promise<Erc4626VaultWithdrawOption> {
    const inputs = [this.shareToken];
    const wantedOutputs = [this.depositToken];
    // selection groups by output token, so the option dedupes with strategy options
    const selectionId = createSelectionId(this.vault.chainId, wantedOutputs);

    return {
      id: createOptionId('vault-erc4626', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: SelectionOrder.Want,
      inputs,
      wantedOutputs,
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
    const input = onlyVaultShareInput(inputs, this.shareToken);
    const outputs = [this.estimateWithdrawOutput(input)];
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

  async fetchZapWithdraw(_request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    throw new Error('Zap withdraw not implemented');
  }
}
