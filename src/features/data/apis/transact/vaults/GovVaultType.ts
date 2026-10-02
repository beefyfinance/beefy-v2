import BigNumber from 'bignumber.js';
import { first } from 'lodash-es';
import type { Namespace, TFunction } from 'react-i18next';
import type { Address } from 'viem';
import { BoostAbi } from '../../../../../config/abi/BoostAbi.ts';
import { BIG_ZERO, fromWei, toWei } from '../../../../../helpers/big-number.ts';
import { exitGovVault, stakeGovVault, unstakeGovVault } from '../../../actions/wallet/gov.ts';
import type { TokenEntity } from '../../../entities/token.ts';
import { isTokenEqual, isTokenErc20 } from '../../../entities/token.ts';
import {
  isGovVault,
  isGovVaultCowcentrated,
  isNonCowcentratedMultiGovVault,
  type VaultGov,
  type VaultGovMulti,
} from '../../../entities/vault.ts';
import type { Step } from '../../../reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../reducers/wallet/transact-types.ts';
import { selectGovVaultPendingRewards } from '../../../selectors/balance.ts';
import { selectFeesByVaultId } from '../../../selectors/fees.ts';
import { selectErc20TokenByAddress, selectTokenByAddress } from '../../../selectors/tokens.ts';
import { selectWalletAddress, selectWalletAddressOrThrow } from '../../../selectors/wallet.ts';
import type { BeefyState, BeefyStateFn } from '../../../store/types.ts';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';
import { buildBoostStakeZapStep, buildBoostWithdrawZapStep } from '../helpers/boost.ts';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
  onlyOneInput,
} from '../helpers/options.ts';
import {
  type AllowanceTokenAmount,
  type GovVaultDepositOption,
  type GovVaultDepositQuote,
  type GovVaultWithdrawOption,
  type GovVaultWithdrawQuote,
  type InputTokenAmount,
  SelectionOrder,
  type TokenAmount,
  type TransactQuote,
} from '../transact-types.ts';
import type {
  IGovVaultType,
  VaultDepositRequest,
  VaultDepositResponse,
  VaultWithdrawRequest,
  VaultWithdrawResponse,
} from './IVaultType.ts';

export class GovVaultType implements IGovVaultType {
  public readonly id = 'gov';
  public readonly vault: VaultGov;
  public readonly depositToken: TokenEntity;
  protected readonly getState: BeefyStateFn;

  constructor(vault: VaultGov, getState: BeefyStateFn) {
    if (!isGovVault(vault)) {
      throw new Error('Vault is not a gov vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  }

  protected calculateDepositFee(input: TokenAmount, state: BeefyState): BigNumber {
    const fees = selectFeesByVaultId(state, this.vault.id);
    const depositFeePercent = fees?.deposit || 0;
    return depositFeePercent > 0 ?
        input.amount
          .multipliedBy(depositFeePercent)
          .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
      : BIG_ZERO;
  }

  protected calculateWithdrawFee(input: TokenAmount, state: BeefyState): BigNumber {
    const fees = selectFeesByVaultId(state, this.vault.id);
    const withdrawFeePercent = fees?.withdraw || 0;
    return withdrawFeePercent > 0 ?
        input.amount
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
      selectionOrder: SelectionOrder.Want,
      selectionHideIfZeroBalance: isGovVaultCowcentrated(this.vault),
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
      step: 'deposit-gov',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: stakeGovVault(this.vault, input.amount),
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
      selectionOrder: SelectionOrder.Want,
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
    const allowances: AllowanceTokenAmount[] = [];
    const fee = this.calculateWithdrawFee(input, state);
    const withdrawAmountAfterFee = input.amount.minus(fee);
    const outputs = [
      {
        token: input.token,
        amount: withdrawAmountAfterFee,
      },
    ];

    if (isWithdrawAll && !isGovVaultCowcentrated(this.vault)) {
      const pendingRewards = selectGovVaultPendingRewards(
        state,
        this.vault.id,
        selectWalletAddress(state)
      );

      outputs.push(...pendingRewards.filter(reward => reward.amount.gt(BIG_ZERO)));
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
      const pendingRewards = quote.outputs.slice(1); // assumes 2nd output+ is the pending rewards

      return {
        step: 'claim-withdraw',
        message: t('Vault-TxnConfirm', { type: t('Claim-Withdraw-noun') }),
        action: exitGovVault(this.vault),
        pending: false,
        extraInfo: {
          rewards: pendingRewards.length ? pendingRewards[0] : undefined, // TODO support multiple earned tokens [empty = ok, length checked]
          vaultId: this.vault.id,
        },
      };
    }

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: unstakeGovVault(this.vault, input.amount),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  /** Only v2 pools (BeefyRewardPool) mint a receipt the zap router can hand back */
  protected getZappableVault(): VaultGovMulti {
    if (!isNonCowcentratedMultiGovVault(this.vault)) {
      throw new Error('Gov vault does not support zap.');
    }
    return this.vault;
  }

  async fetchZapDeposit(request: VaultDepositRequest): Promise<VaultDepositResponse> {
    const vault = this.getZappableVault();
    const input = onlyOneInput(request.inputs);
    if (!isTokenEqual(input.token, this.depositToken) || !isTokenErc20(input.token)) {
      throw new Error('Input token is not the deposit token');
    }

    const state = this.getState();
    const receiptToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
    const outputs = [
      {
        token: receiptToken,
        amount: input.amount.minus(this.calculateDepositFee(input, state)),
      },
    ];

    return {
      inputs: request.inputs,
      outputs,
      minOutputs: outputs,
      zap: buildBoostStakeZapStep(vault, input.token, toWei(input.amount, input.token.decimals)),
    };
  }

  async fetchZapWithdraw(request: VaultWithdrawRequest): Promise<VaultWithdrawResponse> {
    const vault = this.getZappableVault();
    const input = onlyOneInput(request.inputs);
    if (!isTokenEqual(input.token, this.depositToken)) {
      throw new Error('Input token is not the deposit token');
    }

    const state = this.getState();
    const receiptToken = selectErc20TokenByAddress(state, vault.chainId, vault.receiptTokenAddress);
    const address = selectWalletAddressOrThrow(state);
    const pool = fetchContract(vault.contractAddress, BoostAbi, vault.chainId);
    // the order pulls these receipts from the wallet, so a stale state balance must not overshoot
    const balanceWei = new BigNumber(
      (await pool.read.balanceOf([address as Address])).toString(10)
    );
    const requestedWei = toWei(input.amount, receiptToken.decimals);
    const sharesWei = input.max || requestedWei.gt(balanceWei) ? balanceWei : requestedWei;
    const shares = fromWei(sharesWei, receiptToken.decimals);
    const fee = this.calculateWithdrawFee({ token: this.depositToken, amount: shares }, state);
    const outputs = [{ token: this.depositToken, amount: shares.minus(fee) }];

    return {
      inputs: [{ token: receiptToken, amount: shares, max: input.max }],
      outputs,
      minOutputs: outputs,
      zap: buildBoostWithdrawZapStep(vault, sharesWei),
    };
  }
}
