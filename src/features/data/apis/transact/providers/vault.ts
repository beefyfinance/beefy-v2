import {
  InputTokenAmount,
  ITransactProvider,
  TransactOption,
  TransactQuote,
  VaultOption,
  VaultQuote,
} from '../transact-types';
import { isStandardVault, VaultEntity } from '../../../entities/vault';
import { BeefyState } from '../../../../../redux-types';
import { selectStandardVaultById, selectVaultById } from '../../../selectors/vaults';
import { createOptionId, createQuoteId, createTokensId } from '../utils';
import { Step } from '../../../reducers/wallet/stepper';
import { walletActions } from '../../../actions/wallet-actions';
import { Namespace, TFunction } from 'react-i18next';
import { TransactMode } from '../../../reducers/wallet/transact-types';
import { isTokenErc20, TokenErc20 } from '../../../entities/token';

/**
 * Basic deposit/withdraw of single token handled by the vault contract itself
 */
export class VaultProvider implements ITransactProvider {
  getId() {
    return 'vault';
  }

  protected async getModeOptionsFor(
    mode: TransactMode,
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);
    if (!isStandardVault(vault)) {
      return null;
    }

    const depositTokenAddresses = [vault.depositTokenAddress];
    const depositTokenOption: VaultOption = {
      id: createOptionId('vault', vaultId, vault.chainId, depositTokenAddresses),
      providerId: 'vault',
      vaultId: vaultId,
      chainId: vault.chainId,
      tokenAddresses: depositTokenAddresses,
      tokensId: createTokensId(vault.chainId, depositTokenAddresses),
      type: 'vault',
      mode: mode,
    };

    return [depositTokenOption];
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    return this.getModeOptionsFor(TransactMode.Deposit, vaultId, state);
  }

  async getDepositQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<VaultQuote | null> {
    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const vault = selectVaultById(state, option.vaultId);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'vault',
      allowances: amounts
        .filter(tokenAmount => isTokenErc20(tokenAmount.token))
        .map(tokenAmount => ({
          token: tokenAmount.token as TokenErc20,
          amount: tokenAmount.amount,
          spenderAddress: vault.earnContractAddress,
        })),
      inputs: amounts,
      outputs: amounts,
    };
  }

  async getDepositStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectVaultById(state, option.vaultId);

    return {
      step: 'deposit',
      message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
      action: walletActions.deposit(vault, quote.inputs[0].amount, quote.inputs[0].max),
      pending: false,
    };
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    return this.getModeOptionsFor(TransactMode.Withdraw, vaultId, state);
  }

  async getWithdrawQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<VaultQuote | null> {
    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'vault',
      allowances: [],
      inputs: amounts,
      outputs: amounts,
    };
  }

  async getWithdrawStep(
    quote: VaultQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const vault = selectStandardVaultById(state, option.vaultId);
    const depositTokenAmount = quote.inputs[0];

    return {
      step: 'withdraw',
      message: t('Vault-TxnConfirm', { type: t('Withdraw-noun') }),
      action: walletActions.withdraw(vault, depositTokenAmount.amount, depositTokenAmount.max),
      pending: false,
    };
  }
}
