import { BeefyUniswapV2ZapProvider } from './providers/beefy/uniswap-v2';
import { VaultEntity } from '../../entities/vault';
import { BeefyState } from '../../../../redux-types';
import {
  InputTokenAmount,
  ITransactApi,
  ITransactProvider,
  TransactOption,
  TransactQuote,
} from './transact-types';
import { VaultProvider } from './providers/vault';
import { Step } from '../../reducers/wallet/stepper';
import { Namespace, TFunction } from 'react-i18next';
import { GovVaultProvider } from './providers/gov-vault';
import { OneInchZapProvider } from './providers/one-inch/one-inch';
import { BeefySolidlyZapProvider } from './providers/beefy/solidly';
import { partition } from 'lodash';
import { isFulfilledResult } from '../../../../helpers/promises';

export class TransactApi implements ITransactApi {
  private providers: ITransactProvider[] = [];
  private providersById: Record<string, ITransactProvider> = {};

  constructor() {
    this.providers.push(new VaultProvider());
    this.providers.push(new GovVaultProvider());
    this.providers.push(new BeefyUniswapV2ZapProvider());
    this.providers.push(new BeefySolidlyZapProvider());
    this.providers.push(new OneInchZapProvider());

    this.providersById = this.providers.reduce((byId, provider) => {
      byId[provider.getId()] = provider;
      return byId;
    }, {} as Record<string, ITransactProvider>);
  }

  async getDepositOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[]> {
    const optionsByProvider = await Promise.all(
      this.providers.map(provider => provider.getDepositOptionsFor(vaultId, state))
    );

    return optionsByProvider.filter(option => !!option).flat();
  }

  async getWithdrawOptionsFor(
    vaultId: VaultEntity['id'],
    state: BeefyState
  ): Promise<TransactOption[]> {
    const optionsByProvider = await Promise.all(
      this.providers.map(provider => provider.getWithdrawOptionsFor(vaultId, state))
    );

    return optionsByProvider.filter(option => !!option).flat();
  }

  async getDepositQuotesFor(
    options: TransactOption[],
    amounts: InputTokenAmount[],
    state: BeefyState
  ) {
    const quotes = await Promise.allSettled(
      options.map(option => {
        const provider = this.providersById[option.providerId];
        return provider.getDepositQuoteFor(option, amounts, state);
      })
    );

    const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
    const successfulQuotes = fulfilled
      .map(result => result.value)
      .filter(quote => !!quote)
      .flat();

    if (rejected.length > 0) {
      console.warn('getDepositQuotesFor failed', rejected);
    }

    if (successfulQuotes.length > 0) {
      return successfulQuotes;
    }

    if (rejected.length > 0) {
      throw rejected[0].reason;
    }

    throw new Error('No quotes succeeded');
  }

  async getWithdrawQuotesFor(
    options: TransactOption[],
    amounts: InputTokenAmount[],
    state: BeefyState
  ) {
    const quotes = await Promise.allSettled(
      options.map(option => {
        const provider = this.providersById[option.providerId];
        return provider.getWithdrawQuoteFor(option, amounts, state);
      })
    );

    const [fulfilled, rejected] = partition(quotes, isFulfilledResult);
    const successfulQuotes = fulfilled
      .map(result => result.value)
      .filter(quote => !!quote)
      .flat();

    if (rejected.length > 0) {
      console.warn('getWithdrawQuotesFor failed', rejected);
    }

    if (successfulQuotes.length > 0) {
      return successfulQuotes;
    }

    if (rejected.length > 0) {
      throw rejected[0].reason;
    }

    throw new Error('No quotes succeeded');
  }

  async getDepositStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const provider = this.providersById[option.providerId];
    return provider.getDepositStep(quote, option, state, t);
  }

  async getWithdrawStep(
    quote: TransactQuote,
    option: TransactOption,
    state: BeefyState,
    t: TFunction<Namespace>
  ): Promise<Step> {
    const provider = this.providersById[option.providerId];
    return provider.getWithdrawStep(quote, option, state, t);
  }
}
