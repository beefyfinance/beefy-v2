import type BigNumber from 'bignumber.js';
import { first } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import { encodeFunctionData } from 'viem';
import {
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWeiString,
} from '../../../../../helpers/big-number.ts';
import { deposit, withdraw } from '../../../actions/wallet/standard.ts';
import {
  isTokenEqual,
  isTokenErc20,
  isTokenNative,
  type TokenErc20,
  type TokenNative,
} from '../../../entities/token.ts';
import {
  isCowcentratedStandardVault,
  isStandardVault,
  type VaultStandard,
} from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import { selectWalletAddressOrThrow } from '../../../selectors/wallet.ts';
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
import { resolveStandardWithdrawLive } from '../helpers/ppfs-vault.ts';
import { PpfsVaultType } from './PpfsVaultType.ts';
import {
  type AllowanceTokenAmount,
  type InputTokenAmount,
  SelectionOrder,
  type StandardVaultDepositOption,
  type StandardVaultDepositQuote,
  type StandardVaultWithdrawOption,
  type StandardVaultWithdrawQuote,
  type TokenAmount,
  type TransactQuote,
} from '../transact-types.ts';
import type { ZapStep } from '../zap/types.ts';
import type {
  IStandardVaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType.ts';

export class StandardVaultType extends PpfsVaultType<VaultStandard> implements IStandardVaultType {
  public readonly id = 'standard';

  constructor(vault: VaultStandard, getState: BeefyStateFn) {
    if (!isStandardVault(vault)) {
      throw new Error('Vault is not a standard vault');
    }
    super(vault, getState);
  }

  async fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse> {
    onlyInputCount(request.inputs, 1);

    const input = first(request.inputs)!; // we checked length above
    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Input token is not the deposit token');
    }

    const outputs = [await this.resolveDepositLive(input)];

    return {
      inputs: request.inputs,
      outputs,
      minOutputs: outputs,
      zap:
        isTokenNative(input.token) ?
          this.fetchNativeZapDeposit(this.vault.contractAddress, input.token, input.amount)
        : this.fetchErc20ZapDeposit(
            this.vault.contractAddress,
            input.token,
            input.amount,
            input.max
          ),
    };
  }

  protected fetchErc20ZapDeposit(
    vaultAddress: string,
    depositToken: TokenErc20,
    depositAmount: BigNumber,
    depositAll: boolean
  ): ZapStep {
    if (depositAll) {
      return {
        target: vaultAddress,
        value: '0',
        data: encodeFunctionData({
          abi: [
            {
              constant: false,
              inputs: [],
              name: 'depositAll',
              outputs: [],
              payable: false,
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
        }),
        tokens: [
          {
            token: getTokenAddress(depositToken),
            index: -1,
          },
        ],
      };
    }

    return {
      target: vaultAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            constant: false,
            inputs: [
              {
                internalType: 'uint256',
                name: '_amount',
                type: 'uint256',
              },
            ],
            name: 'deposit',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [BigInt(toWeiString(depositAmount, depositToken.decimals))],
      }),
      tokens: [
        {
          token: getTokenAddress(depositToken),
          index: getInsertIndex(0),
        },
      ],
    };
  }

  protected fetchNativeZapDeposit(
    vaultAddress: string,
    depositToken: TokenNative,
    depositAmount: BigNumber
  ): ZapStep {
    return {
      target: vaultAddress,
      value: toWeiString(depositAmount, depositToken.decimals),
      data: encodeFunctionData({
        abi: [
          {
            constant: false,
            inputs: [],
            name: 'depositBNB',
            outputs: [],
            payable: true,
            stateMutability: 'payable',
            type: 'function',
          },
        ],
      }),
      tokens: [
        {
          token: getTokenAddress(depositToken),
          index: -1,
        },
      ],
    };
  }

  async fetchDepositOption(): Promise<StandardVaultDepositOption> {
    const inputs = [this.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return {
      id: createOptionId('vault-standard', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: SelectionOrder.Want,
      selectionHideIfZeroBalance: isCowcentratedStandardVault(this.vault),
      inputs,
      wantedOutputs: [this.shareToken],
      strategyId: 'vault',
      vaultType: 'standard',
      mode: TransactMode.Deposit,
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: StandardVaultDepositOption
  ): Promise<StandardVaultDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Quote called with invalid input token');
    }

    const output = this.estimateDepositShares(input);
    const allowances =
      isTokenErc20(input.token) ?
        [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: this.vault.contractAddress,
          },
        ]
      : [];

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
      action: deposit(this.vault, input.amount, input.max),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawOption(): Promise<StandardVaultWithdrawOption> {
    const inputs = [this.shareToken];
    const wantedOutputs = [this.depositToken];
    // selection groups by output token, so the option dedupes with strategy options
    const selectionId = createSelectionId(this.vault.chainId, wantedOutputs);

    return {
      id: createOptionId('vault-standard', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: SelectionOrder.Want,
      inputs,
      wantedOutputs,
      strategyId: 'vault',
      vaultType: 'standard',
      mode: TransactMode.Withdraw,
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: StandardVaultWithdrawOption
  ): Promise<StandardVaultWithdrawQuote> {
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

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: withdraw(this.vault, input.amount, input.max),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  protected async resolveWithdrawLive(
    input: InputTokenAmount
  ): Promise<{ sharesToWithdrawWei: BigNumber; output: TokenAmount }> {
    const state = this.getState();
    return resolveStandardWithdrawLive(state, this, input, selectWalletAddressOrThrow(state));
  }

  async fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    const input = onlyOneInput(request.inputs);
    if (!isTokenEqual(input.token, this.shareToken)) {
      throw new Error('Input token is not the share token');
    }

    const { sharesToWithdrawWei, output } = await this.resolveWithdrawLive(input);

    const inputs = [
      {
        token: this.shareToken,
        amount: fromWei(sharesToWithdrawWei, this.shareToken.decimals),
        max: input.max,
      },
    ];
    const outputs = [output];

    return {
      inputs,
      outputs,
      minOutputs: outputs,
      zap:
        isTokenNative(this.depositToken) ?
          this.fetchNativeZapWithdraw(
            this.vault.contractAddress,
            this.shareToken,
            sharesToWithdrawWei,
            input.max
          )
        : this.fetchErc20ZapWithdraw(
            this.vault.contractAddress,
            this.shareToken,
            sharesToWithdrawWei,
            input.max
          ),
    };
  }

  protected fetchNativeZapWithdraw(
    vaultAddress: string,
    shareToken: TokenErc20,
    sharesToWithdrawWei: BigNumber,
    withdrawAll: boolean
  ): ZapStep {
    if (withdrawAll) {
      return {
        target: vaultAddress,
        value: '0',
        data: encodeFunctionData({
          abi: [
            {
              constant: false,
              inputs: [],
              name: 'withdrawAllBNB',
              outputs: [],
              payable: false,
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
        }),
        tokens: [
          {
            token: getTokenAddress(shareToken),
            index: -1,
          },
        ],
      };
    }

    return {
      target: vaultAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            constant: false,
            inputs: [
              {
                internalType: 'uint256',
                name: '_shares',
                type: 'uint256',
              },
            ],
            name: 'withdrawBNB',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        args: [bigNumberToBigInt(sharesToWithdrawWei)],
      }),
      tokens: [
        {
          token: getTokenAddress(shareToken),
          index: getInsertIndex(0),
        },
      ],
    };
  }

  protected fetchErc20ZapWithdraw(
    vaultAddress: string,
    shareToken: TokenErc20,
    sharesToWithdrawWei: BigNumber,
    withdrawAll: boolean
  ): ZapStep {
    if (withdrawAll) {
      return {
        target: vaultAddress,
        value: '0',
        data: encodeFunctionData({
          abi: [
            {
              constant: false,
              inputs: [],
              name: 'withdrawAll',
              outputs: [],
              payable: false,
              stateMutability: 'nonpayable',
              type: 'function',
            },
          ],
        }),
        tokens: [
          {
            token: getTokenAddress(shareToken),
            index: -1,
          },
        ],
      };
    }

    return {
      target: vaultAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            constant: false,
            inputs: [
              {
                internalType: 'uint256',
                name: '_shares',
                type: 'uint256',
              },
            ],
            name: 'withdraw',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const,
        args: [bigNumberToBigInt(sharesToWithdrawWei)],
      }),
      tokens: [
        {
          token: getTokenAddress(shareToken),
          index: getInsertIndex(0),
        },
      ],
    };
  }
}
