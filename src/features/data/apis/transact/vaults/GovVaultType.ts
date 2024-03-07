import { isGovVault, type VaultEntity, type VaultGov } from '../../../entities/vault';
import type { BeefyState, GetStateFn } from '../../../../../redux-types';
import { selectTokenByAddress } from '../../../selectors/tokens';
import type {
  IGovVaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyOneInput,
} from '../helpers/options';
import { TransactMode } from '../../../reducers/wallet/transact-types';
import type {
  GovVaultDepositOption,
  GovVaultDepositQuote,
  GovVaultWithdrawOption,
  GovVaultWithdrawQuote,
  InputTokenAmount,
  TokenAmount,
  TransactQuote,
} from '../transact-types';
import type { TokenEntity } from '../../../entities/token';
import { isTokenEqual, isTokenErc20 } from '../../../entities/token';
import { first } from 'lodash-es';
import { BIG_ZERO } from '../../../../../helpers/big-number';
import { selectFeesByVaultId } from '../../../selectors/fees';
import { BigNumber } from 'bignumber.js';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../reducers/wallet/stepper';
import { walletActions } from '../../../actions/wallet-actions';
import { selectGovVaultPendingRewardsInToken } from '../../../selectors/balance';

export class GovVaultType implements IGovVaultType {
  public readonly id = 'gov';
  public readonly vault: VaultGov;
  public readonly depositToken: TokenEntity;
  protected readonly getState: GetStateFn;

  constructor(vault: VaultEntity, getState: GetStateFn) {
    if (!isGovVault(vault)) {
      throw new Error('Vault is not a gov vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  }

  protected calculateDepositFee(input: TokenAmount, state: BeefyState): BigNumber {
    const { deposit: depositFeePercent } = selectFeesByVaultId(state, this.vault.id);
    return depositFeePercent && depositFeePercent > 0
      ? input.amount
          .multipliedBy(depositFeePercent)
          .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
      : BIG_ZERO;
  }

  protected calculateWithdrawFee(input: TokenAmount, state: BeefyState): BigNumber {
    const { withdraw: withdrawFeePercent } = selectFeesByVaultId(state, this.vault.id);
    return withdrawFeePercent > 0
      ? input.amount
          .multipliedBy(withdrawFeePercent)
          .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
      : BIG_ZERO;
  }

  async fetchDepositOption(): Promise<GovVaultDepositOption> {
    const inputs = [this.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return {
      id: createOptionId('vault-gov', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: 1,
      inputs,
      wantedOutputs: inputs,
      strategyId: 'vault',
      vaultType: 'gov',
      mode: TransactMode.Deposit,
    };
  }

  async fetchDepositQuote(
    inputs: InputTokenAmount[],
    option: GovVaultDepositOption
  ): Promise<GovVaultDepositQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Quote called with invalid input token');
    }

    const state = this.getState();
    const fee = this.calculateDepositFee(input, state);
    const output = {
      token: input.token,
      amount: input.amount.minus(fee),
    };

    const allowances = isTokenErc20(input.token)
      ? [
          {
            token: input.token,
            amount: input.amount,
            spenderAddress: this.vault.earnContractAddress,
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
      step: 'deposit-gov',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.stakeGovVault(this.vault, input.amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchWithdrawOption(): Promise<GovVaultWithdrawOption> {
    const inputs = [this.depositToken];
    const selectionId = createSelectionId(this.vault.chainId, inputs);

    return {
      id: createOptionId('vault-gov', this.vault.id, selectionId),
      vaultId: this.vault.id,
      chainId: this.vault.chainId,
      selectionId,
      selectionOrder: 1,
      inputs,
      wantedOutputs: inputs,
      strategyId: 'vault',
      vaultType: 'gov',
      mode: TransactMode.Withdraw,
    };
  }

  async fetchWithdrawQuote(
    inputs: InputTokenAmount[],
    option: GovVaultWithdrawOption
  ): Promise<GovVaultWithdrawQuote> {
    const input = onlyOneInput(inputs);
    if (input.amount.lte(BIG_ZERO)) {
      throw new Error('Quote called with 0 input amount');
    }

    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Quote called with invalid input token');
    }

    const state = this.getState();
    const isWithdrawAll = input.max;
    const allowances = [];
    const fee = this.calculateWithdrawFee(input, state);
    const withdrawAmountAfterFee = input.amount.minus(fee);
    const outputs = [
      {
        token: input.token,
        amount: withdrawAmountAfterFee,
      },
    ];

    if (isWithdrawAll) {
      const pendingRewards = selectGovVaultPendingRewardsInToken(state, this.vault.id);
      if (pendingRewards.gt(BIG_ZERO)) {
        const rewardToken = selectTokenByAddress(
          state,
          this.vault.chainId,
          this.vault.earnedTokenAddress
        );
        outputs.push({
          token: rewardToken,
          amount: pendingRewards,
        });
      }
    }

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
    const isWithdrawAll = input.max;
    const hasPendingRewards = quote.outputs.length > 1;

    // 'exit' withdraws all and claims pending rewards
    // will revert if there is no pending rewards
    if (isWithdrawAll && hasPendingRewards) {
      const rewardTokenAmount = quote.outputs[1]; // assumes 2nd output is the pending reward

      return {
        step: 'claim-withdraw',
        message: t('Vault-TxnConfirm', { type: t('Claim-Withdraw-noun') }),
        action: walletActions.exitGovVault(this.vault),
        pending: false,
        extraInfo: {
          rewards: {
            token: rewardTokenAmount.token,
            amount: rewardTokenAmount.amount,
          },
          vaultId: this.vault.id,
        },
      };
    }

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.unstakeGovVault(this.vault, input.amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  async fetchZapDeposit(_request: VaultDepositRequest): Promise<VaultDepositResponse> {
    throw new Error('Gov vaults do not support zap.');
  }

  async fetchZapWithdraw(_request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    throw new Error('Gov vaults do not support zap.');
  }
}
