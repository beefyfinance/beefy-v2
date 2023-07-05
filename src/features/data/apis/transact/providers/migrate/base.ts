import type {
  InputTokenAmount,
  ITransactProvider,
  MigrateOption,
  MigrateQuote,
  TransactOption,
  TransactQuote,
} from '../../transact-types';
import type { VaultEntity } from '../../../../entities/vault';
import type { BeefyState } from '../../../../../../redux-types';
import type { Namespace, TFunction } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper';
import { createOptionId, createQuoteId, createTokensId } from '../../utils';
import type { TokenErc20 } from '../../../../entities/token';
import { selectVaultById } from '../../../../selectors/vaults';
import { first } from 'lodash-es';
import { selectWalletAddress } from '../../../../selectors/wallet';
import { TransactMode } from '../../../../reducers/wallet/transact-types';
import { walletActions } from '../../../../actions/wallet-actions';
import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

export abstract class BaseMigrateProvider implements ITransactProvider {
  constructor(protected vaultProvider: ITransactProvider) {}

  getId(): string {
    return `migrate-${this.type}`;
  }

  abstract type: string;

  abstract hasMigrateOptions(vault: VaultEntity, state: BeefyState): boolean;

  abstract getMigrateBalanceFor(
    vault: VaultEntity,
    userAddress: string,
    state: BeefyState
  ): Promise<BigNumber>;

  abstract getUnstakeMethodFor(
    vault: VaultEntity,
    amount: BigNumber,
    state: BeefyState
  ): // eslint-disable-next-line
  Promise<any>;

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[] | null> {
    const vault = selectVaultById(state, vaultId);
    if (!this.hasMigrateOptions(vault, state)) {
      return null;
    }

    const tokenAddresses = [vault.depositTokenAddress];
    return [
      {
        id: createOptionId(this.getId(), vaultId, vault.chainId, tokenAddresses),
        type: 'migrate',
        mode: TransactMode.Deposit,
        providerId: this.getId(),
        vaultId: vaultId,
        chainId: vault.chainId,
        tokensId: createTokensId(vault.chainId, tokenAddresses),
        tokenAddresses,
      },
    ];
  }

  async getDepositQuoteFor(
    option: TransactOption,
    amounts: InputTokenAmount[],
    state: BeefyState
  ): Promise<MigrateQuote | null> {
    if (!this.isMigrateOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    if (amounts.length !== 1) {
      throw new Error(`Only 1 input token supported`);
    }

    const userInput = first(amounts);
    const vault = selectVaultById(state, option.vaultId);
    const userAddress = selectWalletAddress(state);
    if (!userAddress) {
      return null;
    }
    const availableBalance = await this.getMigrateBalanceFor(vault, userAddress, state);
    if (availableBalance.lte(BIG_ZERO)) {
      return null;
    }

    // workaround for migrateAll button without direct userInput
    if (userInput.amount.lte(BIG_ZERO)) {
      userInput.amount = availableBalance;
    }

    const depositOptions = await this.vaultProvider.getDepositOptionsFor(option.vaultId, state);
    if (depositOptions.length == 0) {
      throw Error(`No vault deposit option for ${option.vaultId}`);
    }
    const depositOption = first(depositOptions);
    const depositQuote = await this.vaultProvider.getDepositQuoteFor(depositOption, amounts, state);

    return {
      id: createQuoteId(option.id),
      optionId: option.id,
      type: 'migrate',
      allowances: [
        {
          token: userInput.token as TokenErc20,
          amount: userInput.amount,
          spenderAddress: vault.earnContractAddress,
        },
      ],
      inputs: [userInput],
      outputs: [userInput],
      availableBalance: availableBalance,
      depositOption,
      depositQuote,
    };
  }

  async getDepositStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    if (!this.isMigrateOption(option)) {
      throw new Error(`Wrong option type passed to ${this.getId()}`);
    }

    const vault = selectVaultById(state, option.vaultId);
    const amount = quote.inputs[0].amount;
    const unstakeCall = await this.getUnstakeMethodFor(vault, amount, state);

    return {
      step: 'unstake',
      message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
      action: walletActions.migrateUnstake(unstakeCall, vault, amount),
      pending: false,
      extraInfo: { vaultId: vault.id },
    };
  }

  isMigrateOption(option: TransactOption): option is MigrateOption {
    return option.providerId === this.getId();
  }

  getWithdrawOptionsFor(
    _vaultId: VaultEntity['id'],
    _state: BeefyState
  ): Promise<TransactOption[] | null> {
    return null;
  }

  getWithdrawQuoteFor(
    _option: TransactOption,
    _amounts: InputTokenAmount[],
    _state: BeefyState
  ): Promise<TransactQuote | null> {
    return null;
  }

  getWithdrawStep(
    _quote: TransactQuote,
    _option: TransactOption,
    _state: BeefyState,
    _t: TFunction<Namespace>
  ): Promise<Step> {
    return null;
  }
}
