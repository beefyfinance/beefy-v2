import BigNumber from 'bignumber.js';
import { BIG_ZERO, fromWei, tokenAmountToWei } from '../../../../../helpers/big-number';
import type { BeefyState, GetStateFn } from '../../../../../redux-types';
import {
  isTokenEqual,
  isTokenErc20,
  type TokenEntity,
  type TokenErc20,
} from '../../../entities/token';
import { isCowcentratedVault, type VaultCowcentrated } from '../../../entities/vault';
import { TransactMode } from '../../../reducers/wallet/transact-types';
import { selectTokenByAddress } from '../../../selectors/tokens';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyOneInput,
} from '../helpers/options';
import type {
  CowcentratedVaultDepositOption,
  CowcentratedVaultDepositQuote,
  CowcentratedVaultWithdrawOption,
  CowcentratedVaultWithdrawQuote,
  InputTokenAmount,
  TokenAmount,
} from '../transact-types';
import type {
  ICowcentratedVaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType';
import { selectFeesByVaultId } from '../../../selectors/fees';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../reducers/wallet/stepper';
import { walletActions } from '../../../actions/wallet-actions';
import { selectChainById } from '../../../selectors/chains';
import { BeefyCLMPool } from '../../beefy/beefy-clm-pool';
import { selectVaultStrategyAddress } from '../../../selectors/vaults';
import type { ZapStep } from '../zap/types';
import abiCoder from 'web3-eth-abi';
import { getInsertIndex } from '../helpers/zap';
import { slipAllBy } from '../helpers/amounts';
import { selectTransactSlippage } from '../../../selectors/transact';

export class CowcentratedVaultType implements ICowcentratedVaultType {
  public readonly id = 'cowcentrated';
  public readonly vault: VaultCowcentrated;
  public readonly depositTokens: TokenEntity[];
  public readonly shareToken: TokenErc20;
  protected readonly getState: GetStateFn;

  constructor(vault: VaultCowcentrated, getState: GetStateFn) {
    if (!isCowcentratedVault(vault)) {
      throw new Error('Vault is not a cowcentrated liquidity vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositTokens = vault.depositTokenAddresses.map(tokenAddress =>
      selectTokenByAddress(state, vault.chainId, tokenAddress)
    );

    const shareToken = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);
    if (!isTokenErc20(shareToken)) {
      throw new Error('Share token is not an ERC20 token');
    }
    this.shareToken = shareToken;
  }

  async fetchDepositOption(): Promise<CowcentratedVaultDepositOption> {
    const inputs = this.depositTokens;
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return {
      id: createOptionId('vault-cowcentrated', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: 1,
      inputs,
      wantedOutputs: inputs,
      strategyId: 'vault',
      vaultType: 'cowcentrated',
      mode: TransactMode.Deposit,
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedVaultDepositOption
  ): Promise<CowcentratedVaultDepositQuote> {
    onlyInputCount(inputs, 2);

    if (inputs.every(input => input.amount.lte(BIG_ZERO))) {
      throw new Error('Quote called with 0 input amount');
    }

    if (inputs.some((input, index) => !isTokenEqual(input.token, this.depositTokens[index]))) {
      throw new Error('Quote called with invalid input token');
    }

    const state = this.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vault.earnContractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.depositTokens
    );

    const { isCalm, liquidity, used0, used1, unused0, unused1, position1, position0 } =
      await clmPool.previewDeposit(inputs[0].amount, inputs[1].amount);
    const depositUsed = [used0, used1].map((amount, i) => ({
      token: this.depositTokens[i],
      amount: fromWei(amount, this.depositTokens[i].decimals),
    }));
    const depositUnused = [unused0, unused1].map((amount, i) => ({
      token: this.depositTokens[i],
      amount: fromWei(amount, this.depositTokens[i].decimals),
    }));
    const depositPosition = [position0, position1].map((amount, i) => ({
      token: this.depositTokens[i],
      amount: fromWei(amount, this.depositTokens[i].decimals),
    }));

    const outputs = [
      {
        token: this.shareToken,
        amount: fromWei(liquidity, this.shareToken.decimals),
      },
    ];

    const allowances = inputs
      .filter(input => isTokenErc20(input.token))
      .map(input => ({
        token: input.token as TokenErc20,
        amount: input.amount,
        spenderAddress: this.vault.earnContractAddress,
      }));

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
      isCalm,
      unused: depositUnused,
      used: depositUsed,
      position: depositPosition,
    };
  }

  async fetchDepositStep(
    quote: CowcentratedVaultDepositQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    onlyInputCount(quote.inputs, 2);
    return {
      step: 'deposit',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.v3Deposit(this.vault, quote.inputs[0].amount, quote.inputs[1].amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  protected calculateDepositFee(inputs: TokenAmount[], state: BeefyState): BigNumber {
    const { deposit: depositFeePercent } = selectFeesByVaultId(state, this.vault.id);
    return depositFeePercent && depositFeePercent > 0
      ? inputs
          .map(input =>
            input.amount
              .multipliedBy(depositFeePercent)
              .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
          )
          .reduce((a, b) => a.plus(b), BIG_ZERO)
      : BIG_ZERO;
  }

  async fetchWithdrawOption(): Promise<CowcentratedVaultWithdrawOption> {
    const inputs = [this.shareToken];
    const outputs = this.depositTokens;
    const selectionId = createSelectionId(this.vault.chainId, outputs);

    return {
      id: createOptionId('vault-cowcentrated', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: 1,
      inputs: inputs,
      wantedOutputs: outputs,
      strategyId: 'vault',
      vaultType: 'cowcentrated',
      mode: TransactMode.Withdraw,
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedVaultWithdrawOption
  ): Promise<CowcentratedVaultWithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    const state = this.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vault.earnContractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.depositTokens
    );
    const { amount0, amount1 } = await clmPool.previewWithdraw(input.amount);

    const outputs: TokenAmount[] = [
      {
        token: this.depositTokens[0],
        amount: fromWei(amount0, this.depositTokens[0].decimals),
      },
      {
        token: this.depositTokens[1],
        amount: fromWei(amount1, this.depositTokens[1].decimals),
      },
    ];

    return {
      id: createQuoteId(option.id),
      strategyId: 'vault',
      vaultType: option.vaultType,
      option,
      inputs,
      outputs,
      returned: [],
      allowances: [],
      priceImpact: 0,
    };
  }

  async fetchWithdrawStep(
    quote: CowcentratedVaultWithdrawQuote,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const input = onlyOneInput(quote.inputs);

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.v3Withdraw(this.vault, input.amount, input.max ?? false),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchZapDeposit(_request: VaultDepositRequest): Promise<VaultDepositResponse> {
    throw new Error('Zap deposit not implemented for cowcentrated vaults');
  }

  async fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    const input = onlyOneInput(request.inputs);
    if (!isTokenEqual(input.token, this.shareToken)) {
      throw new Error('Input token is not the share token');
    }

    const state = this.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vault.earnContractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.depositTokens
    );
    const { amount0, amount1 } = await clmPool.previewWithdraw(input.amount);

    const outputs: TokenAmount[] = [
      {
        token: this.depositTokens[0],
        amount: fromWei(amount0, this.depositTokens[0].decimals),
      },
      {
        token: this.depositTokens[1],
        amount: fromWei(amount1, this.depositTokens[1].decimals),
      },
    ];

    const slippage = selectTransactSlippage(state);
    const minOutputs = slipAllBy(outputs, slippage);

    return {
      inputs: request.inputs,
      outputs,
      minOutputs,
      zap: this.buildZapWithdrawTx(
        this.shareToken.address,
        tokenAmountToWei(input),
        tokenAmountToWei(minOutputs[0]),
        tokenAmountToWei(minOutputs[1]),
        input.max
      ),
    };
  }

  protected buildZapWithdrawTx(
    clmAddress: string,
    amountToWithdrawWei: BigNumber,
    minAmountAWei: BigNumber,
    minAmountBWei: BigNumber,
    withdrawAll: boolean
  ): ZapStep {
    if (withdrawAll) {
      return {
        target: clmAddress,
        value: '0',
        data: abiCoder.encodeFunctionCall(
          {
            constant: false,
            inputs: [
              {
                name: '_minAmount0',
                type: 'uint256',
              },
              {
                name: '_minAmount1',
                type: 'uint256',
              },
            ],
            name: 'withdrawAll',
            outputs: [],
            payable: false,
            stateMutability: 'nonpayable',
            type: 'function',
          },
          [minAmountAWei.toString(10), minAmountBWei.toString(10)]
        ),
        tokens: [
          {
            token: clmAddress,
            index: -1,
          },
        ],
      };
    }

    return {
      target: clmAddress,
      value: '0',
      data: abiCoder.encodeFunctionCall(
        {
          constant: false,
          inputs: [
            {
              name: '_shares',
              type: 'uint256',
            },
            {
              name: '_minAmount0',
              type: 'uint256',
            },
            {
              name: '_minAmount1',
              type: 'uint256',
            },
          ],
          name: 'withdraw',
          outputs: [],
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function',
        },
        [amountToWithdrawWei.toString(10), minAmountAWei.toString(10), minAmountBWei.toString(10)]
      ),
      tokens: [
        {
          token: clmAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }
}
