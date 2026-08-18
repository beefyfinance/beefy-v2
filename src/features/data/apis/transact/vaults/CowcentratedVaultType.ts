import type BigNumber from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import { type Abi, encodeFunctionData } from 'viem';
import {
  BIG_ZERO,
  bigNumberToBigInt,
  fromWei,
  toWeiFromTokenAmount,
} from '../../../../../helpers/big-number.ts';
import { v3Deposit, v3Withdraw } from '../../../actions/wallet/cowcentrated.ts';
import {
  isTokenEqual,
  isTokenErc20,
  type TokenEntity,
  type TokenErc20,
} from '../../../entities/token.ts';
import { isCowcentratedVault, type VaultCowcentrated } from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import { selectChainById } from '../../../selectors/chains.ts';
import { selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectTransactSlippage } from '../../../selectors/transact.ts';
import { selectVaultStrategyAddress } from '../../../selectors/vaults.ts';
import type { BeefyStateFn } from '../../../store/types.ts';
import { BeefyCLMPool } from '../../beefy/beefy-clm-pool.ts';
import { slipAllBy } from '../helpers/amounts.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyOneInput,
} from '../helpers/options.ts';
import { calculatePriceImpact } from '../helpers/quotes.ts';
import { getInsertIndex } from '../helpers/zap.ts';
import {
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotCalmError,
} from '../strategies/error.ts';
import {
  type CowcentratedVaultDepositOption,
  type CowcentratedVaultDepositQuote,
  type CowcentratedVaultWithdrawOption,
  type CowcentratedVaultWithdrawQuote,
  type InputTokenAmount,
  SelectionOrder,
  type TokenAmount,
} from '../transact-types.ts';
import type { ZapStep } from '../zap/types.ts';
import type {
  ICowcentratedVaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType.ts';

export class CowcentratedVaultType implements ICowcentratedVaultType {
  public readonly id = 'cowcentrated';
  public readonly vault: VaultCowcentrated;
  public readonly depositTokens: TokenEntity[];
  public readonly shareToken: TokenErc20;
  protected readonly getState: BeefyStateFn;

  constructor(vault: VaultCowcentrated, getState: BeefyStateFn) {
    if (!isCowcentratedVault(vault)) {
      throw new Error('Vault is not a cowcentrated liquidity vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositTokens = vault.depositTokenAddresses.map(tokenAddress =>
      selectTokenByAddress(state, vault.chainId, tokenAddress)
    );

    const shareToken = selectTokenByAddress(state, vault.chainId, vault.contractAddress);
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
      selectionOrder: SelectionOrder.AllTokensInPool,
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
      this.vault.contractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.depositTokens
    );

    const { isCalm, liquidity, used0, used1, unused0, unused1, position1, position0 } =
      await clmPool.previewDeposit(inputs[0].amount, inputs[1].amount);

    if (liquidity.lte(BIG_ZERO)) {
      throw new QuoteCowcentratedNoSingleSideError(inputs);
    }

    if (!isCalm) {
      throw new QuoteCowcentratedNotCalmError('deposit');
    }

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

    const usedInputs: InputTokenAmount[] = inputs.map((input, i) => ({
      token: input.token,
      amount: fromWei(i === 0 ? used0 : used1, input.token.decimals),
      max: input.max,
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
        spenderAddress: this.vault.contractAddress,
      }));

    return {
      id: createQuoteId(option.id),
      strategyId: option.strategyId,
      vaultType: option.vaultType,
      option,
      inputs: usedInputs,
      outputs,
      returned: [],
      allowances,
      priceImpact: calculatePriceImpact(usedInputs, outputs, [], state),
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
      action: v3Deposit(this.vault, quote.inputs[0].amount, quote.inputs[1].amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
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
      selectionOrder: SelectionOrder.AllTokensInPool,
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
      this.vault.contractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.depositTokens
    );
    const { amount0, amount1, isCalm } = await clmPool.previewWithdraw(input.amount);

    if (!isCalm) {
      throw new QuoteCowcentratedNotCalmError('withdraw');
    }

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
      isCalm,
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
      action: v3Withdraw(this.vault, input.amount, input.max ?? false),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse> {
    if (request.inputs.length !== this.depositTokens.length) {
      throw new Error('Invalid number of inputs');
    }
    if (
      request.inputs.some((input, index) => !isTokenEqual(input.token, this.depositTokens[index]))
    ) {
      throw new Error('Invalid input tokens');
    }

    const state = this.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const slippage = selectTransactSlippage(state);
    const clmPool = new BeefyCLMPool(
      this.vault.contractAddress,
      selectVaultStrategyAddress(state, this.vault.id),
      chain,
      this.depositTokens
    );

    const { liquidity } = await clmPool.previewDeposit(
      request.inputs[0].amount,
      request.inputs[1].amount
    );

    const outputs: TokenAmount[] = [
      {
        token: this.shareToken,
        amount: fromWei(liquidity, this.shareToken.decimals),
      },
    ];

    const minOutputs = slipAllBy(outputs, slippage);

    return {
      inputs: request.inputs,
      outputs,
      minOutputs,
      zap: this.buildZapDepositTx(
        this.shareToken.address,
        toWeiFromTokenAmount(request.inputs[0]),
        toWeiFromTokenAmount(request.inputs[1]),
        toWeiFromTokenAmount(minOutputs[0]),
        request.inputs[0].token.address,
        request.inputs[1].token.address,
        true
      ),
    };
  }

  async fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    const input = onlyOneInput(request.inputs);
    if (!isTokenEqual(input.token, this.shareToken)) {
      throw new Error('Input token is not the share token');
    }

    const state = this.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const clmPool = new BeefyCLMPool(
      this.vault.contractAddress,
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
        toWeiFromTokenAmount(input),
        toWeiFromTokenAmount(minOutputs[0]),
        toWeiFromTokenAmount(minOutputs[1]),
        input.max
      ),
    };
  }

  protected buildZapDepositTx(
    clmAddress: string,
    amountA: BigNumber,
    amountB: BigNumber,
    minShares: BigNumber,
    tokenA: string,
    tokenB: string,
    insertBalance: boolean
  ): ZapStep {
    return {
      target: clmAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'deposit',
            constant: false,
            payable: false,
            inputs: [
              {
                name: '_amount0',
                type: 'uint256',
              },
              {
                name: '_amount1',
                type: 'uint256',
              },
              {
                name: '_minShares',
                type: 'uint256',
              },
            ],
            stateMutability: 'nonpayable',
            outputs: [],
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(amountA),
          bigNumberToBigInt(amountB),
          bigNumberToBigInt(minShares),
        ],
      }),
      tokens: [
        {
          token: tokenA,
          index: insertBalance ? getInsertIndex(0) : -1,
        },
        {
          token: tokenB,
          index: insertBalance ? getInsertIndex(1) : -1,
        },
      ],
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
        data: encodeFunctionData({
          abi: [
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
          ] as const satisfies Abi,
          args: [bigNumberToBigInt(minAmountAWei), bigNumberToBigInt(minAmountBWei)],
        }),
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
      data: encodeFunctionData({
        abi: [
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
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(amountToWithdrawWei),
          bigNumberToBigInt(minAmountAWei),
          bigNumberToBigInt(minAmountBWei),
        ],
      }),
      tokens: [
        {
          token: clmAddress,
          index: getInsertIndex(0),
        },
      ],
    };
  }
}
