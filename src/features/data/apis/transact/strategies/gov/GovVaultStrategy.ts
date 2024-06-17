import type { TFunction, Namespace } from 'react-i18next';
import type { Step } from '../../../../reducers/wallet/stepper';
import type {
  DepositOption,
  InputTokenAmount,
  DepositQuote,
  TransactQuote,
  WithdrawOption,
  WithdrawQuote,
} from '../../transact-types';
import type { GovVaultStrategyOptions, IStrategy, ZapTransactHelpers } from '../IStrategy';
import { isGovVault, type VaultGov } from '../../../../entities/vault';
import { isGovVaultType, type IGovVaultType, type IVaultType } from '../../vaults/IVaultType';

export class GovVaultStrategy<TOptions extends GovVaultStrategyOptions> implements IStrategy {
  public readonly id = 'gov';
  protected readonly vault: VaultGov;
  protected readonly vaultType: IGovVaultType;
  protected readonly underlyingVault: IVaultType | undefined;

  constructor(protected options: TOptions, protected helpers: ZapTransactHelpers) {
    const { vault, vaultType } = this.helpers;
    if (!isGovVault(vault)) {
      throw new Error('Vault is not a cowcentrated vault');
    }
    if (!isGovVaultType(vaultType)) {
      throw new Error('Vault type is not cowcentrated');
    }
    this.vault = vault;
    this.vaultType = vaultType;

    // if underlying exists, get its strategy
    this.underlyingVault = undefined;
  }

  fetchDepositOptions(): Promise<DepositOption[]> {
    console.log('FETCHING DEPOSIT OPTIONS');
    return Promise.resolve([]);
    // throw new Error("Method not implemented.");
  }
  fetchDepositQuote(inputs: InputTokenAmount[], option: DepositOption): Promise<DepositQuote> {
    if (!inputs || !option) console.log();
    throw new Error('Method not implemented.');
  }
  fetchDepositStep(quote: TransactQuote, t: TFunction<Namespace, undefined>): Promise<Step> {
    if (!quote || !t) console.log();

    throw new Error('Method not implemented.');
  }
  fetchWithdrawOptions(): Promise<WithdrawOption[]> {
    throw new Error('Method not implemented.');
  }
  fetchWithdrawQuote(inputs: InputTokenAmount[], option: WithdrawOption): Promise<WithdrawQuote> {
    if (!inputs || !option) console.log();
    throw new Error('Method not implemented.');
  }
  fetchWithdrawStep(quote: TransactQuote, t: TFunction<Namespace, undefined>): Promise<Step> {
    if (!quote || !t) console.log();
    throw new Error('Method not implemented.');
  }
}
