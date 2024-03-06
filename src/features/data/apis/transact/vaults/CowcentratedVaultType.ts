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
import { selectTokenByAddress, selectTokenById } from '../../../selectors/tokens';
import {
  createOptionId,
  createQuoteId,
  createSelectionId,
  onlyInputCount,
} from '../helpers/options';
import type {
  CowcentratedDepositOption,
  CowcentratedVaultDepositQuote,
  InputTokenAmount,
  TokenAmount,
  TransactQuote,
} from '../transact-types';
import type { ICowcentratedVaultType } from './IVaultType';
import { selectFeesByVaultId } from '../../../selectors/fees';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../reducers/wallet/stepper';
import { walletActions } from '../../../actions/wallet-actions';

export class CowcentratedVaultType implements ICowcentratedVaultType {
  public readonly id = 'cowcentrated';
  public readonly vault: VaultCowcentrated;
  public readonly depositToken: TokenEntity;
  public readonly depositTokens: TokenEntity[];
  public readonly shareToken: TokenErc20;
  protected readonly getState: GetStateFn;

  constructor(vault: VaultEntity, getState: GetStateFn) {
    if (!isCowcentratedLiquidityVault(vault)) {
      throw new Error('Vault is not a cowcentrated liquidity vault');
    }

    const state = getState();
    this.getState = getState;
    this.vault = vault;
    this.depositTokens = vault.assetIds.map(tokenId =>
      selectTokenById(state, vault.chainId, tokenId)
    );

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
    const fee = this.calculateDepositFee(inputs, state);
    const outputs = inputs.map(input => ({
      token: input.token,
      amount: input.amount.minus(fee),
    }));

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
    };
  }

  async fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace>): Promise<Step> {
    onlyInputCount(quote.inputs, 2);

    return {
      step: 'deposit',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.deposit(this.vault, quote.inputs[0].amount, quote.inputs[0].max),
      pending: false,
      extraInfo: { zap: false, vaultId: quote.option.vaultId },
    };
  }

  protected calculateDepositFee(inputs: TokenAmount[], state: BeefyState): BigNumber {
    const { deposit: depositFeePercent } = selectFeesByVaultId(state, this.vault.id);
    return depositFeePercent > 0
      ? inputs
          .map(input =>
            input.amount
              .multipliedBy(depositFeePercent)
              .decimalPlaces(input.token.decimals, BigNumber.ROUND_FLOOR)
          )
          .reduce((a, b) => a.plus(b), BIG_ZERO)
      : BIG_ZERO;
  }

  // async fetchDepositQuote
}
