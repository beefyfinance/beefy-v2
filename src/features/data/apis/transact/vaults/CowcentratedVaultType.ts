import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import type { BeefyState, GetStateFn } from '../../../../../redux-types';
import {
  type TokenErc20,
  isTokenErc20,
  type TokenEntity,
  isTokenEqual,
} from '../../../entities/token';
import {
  type VaultEntity,
  isCowcentratedLiquidityVault,
  type VaultCowcentrated,
} from '../../../entities/vault';
import { TransactMode } from '../../../reducers/wallet/transact-types';
import { selectTokenByAddress } from '../../../selectors/tokens';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
} from '../helpers/options';
import type {
  CowcentratedDepositOption,
  CowcentratedVaultDepositQuote,
  CowcentratedVaultWithdrawQuote,
  CowcentratedWithdrawOption,
  InputTokenAmount,
  TokenAmount,
  TransactQuote,
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
import {
  getCowcentratedVaultDepositSimulationAmount,
  getCowcentratedVaultWithdrawSimulationAmount,
} from '../helpers/cowcentratedVault';
import { getWeb3Instance } from '../../instances';
import { selectChainById } from '../../../selectors/chains';
import { MultiCall } from 'eth-multicall';
import { first } from 'lodash-es';

export class CowcentratedVaultType implements ICowcentratedVaultType {
  public readonly id = 'cowcentrated';
  public readonly vault: VaultCowcentrated;
  public readonly depositToken: TokenEntity;
  public readonly depositTokens: TokenEntity[];
  public readonly vaultToken: TokenEntity;
  public readonly shareToken: TokenErc20;
  protected readonly getState: GetStateFn;

  constructor(vault: VaultEntity, getState: GetStateFn) {
    if (!isCowcentratedLiquidityVault(vault)) {
      throw new Error('Vault is not a cowcentrated liquidity vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositTokens = vault.depositTokenAddresses.map(tokenAddress =>
      selectTokenByAddress(state, vault.chainId, tokenAddress)
    );
    this.vaultToken = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);

    const shareToken = selectTokenByAddress(state, vault.chainId, vault.earnContractAddress);
    if (!isTokenErc20(shareToken)) {
      throw new Error('Share token is not an ERC20 token');
    }
    this.shareToken = shareToken;
  }

  async fetchDepositOption(): Promise<CowcentratedDepositOption> {
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
      strategyId: 'cowcentrated',
      vaultType: 'cowcentrated',
      mode: TransactMode.Deposit,
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedDepositOption
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
    const web3 = await getWeb3Instance(chain);
    const multicall = new MultiCall(web3, chain.multicallAddress);

    const resp = await getCowcentratedVaultDepositSimulationAmount(
      inputs,
      this.vault,
      state,
      web3,
      multicall
    );

    const outputs = [
      {
        token: this.vaultToken,
        amount: resp.depositPreviewAmount.shiftedBy(-18),
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
      amountsUsed: [
        {
          token: this.depositTokens[0],
          amount: resp.usedToken0.shiftedBy(-this.depositTokens[0].decimals),
        },
        {
          token: this.depositTokens[1],
          amount: resp.usedToken1.shiftedBy(-this.depositTokens[1].decimals),
        },
      ],
      amountsReturned: [
        {
          token: this.depositTokens[0],
          amount: resp.returnAmount0.shiftedBy(-this.depositTokens[0].decimals),
        },
        {
          token: this.depositTokens[1],
          amount: resp.returnAmount1.shiftedBy(-this.depositTokens[1].decimals),
        },
      ],
      allowances,
      priceImpact: 0,
      isCalm: resp.isCalm,
    };
  }

  async fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step> {
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

  async fetchWithdrawOption(): Promise<CowcentratedWithdrawOption> {
    const vaultToken = selectTokenByAddress(
      this.getState(),
      this.vault.chainId,
      this.vault.earnContractAddress
    );
    const selectionId = createSelectionId(this.vault.chainId, [vaultToken]);
    const outputs = this.vault.depositTokenAddresses.map(tokenAddress =>
      selectTokenByAddress(this.getState(), this.vault.chainId, tokenAddress)
    );

    return {
      id: createOptionId('vault-cowcentrated', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: 1,
      inputs: [vaultToken],
      wantedOutputs: outputs,
      strategyId: 'cowcentrated',
      vaultType: 'cowcentrated',
      mode: TransactMode.Withdraw,
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: CowcentratedWithdrawOption
  ): Promise<CowcentratedVaultWithdrawQuote> {
    onlyInputCount(inputs, 1);

    const input = inputs[0];
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    const state = this.getState();
    const chain = selectChainById(state, this.vault.chainId);
    const web3 = await getWeb3Instance(chain);
    const multicall = new MultiCall(web3, chain.multicallAddress);
    const { withdrawPreviewAmounts } = await getCowcentratedVaultWithdrawSimulationAmount(
      inputs[0],
      this.vault,
      state,
      web3,
      multicall
    );

    const outputs = option.wantedOutputs.map((output, index) => ({
      token: output,
      amount: withdrawPreviewAmounts[index].shiftedBy(-output.decimals),
    }));

    const allowances = [];

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

    const input = first(quote.inputs);

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.v3Withdraw(this.vault, input?.amount ?? BIG_ZERO, input?.max ?? false),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchZapDeposit(_request: VaultDepositRequest): Promise<VaultDepositResponse> {
    throw new Error('Cowcentrated vaults do not support zap.');
  }

  async fetchZapWithdraw(_request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    throw new Error('Cowcentrated vaults do not support zap.');
  }
}
