import { BeefyUniswapV2ZapProvider } from './providers/beefy/uniswap-v2';
import { VaultEntity } from '../../entities/vault';
import { BeefyState } from '../../../../redux-types';
import BigNumber from 'bignumber.js';
import { ITransactApi, ITransactProvider, TransactOption } from './transact-types';
import { VaultProvider } from './providers/vault';

export class TransactApi implements ITransactApi {
  private providers: ITransactProvider[] = [];
  private providersById: Record<ITransactProvider['id'], ITransactProvider> = {};

  constructor() {
    this.providers.push(new VaultProvider());
    this.providers.push(new BeefyUniswapV2ZapProvider());

    this.providersById = this.providers.reduce((byId, provider) => {
      byId[provider.id] = provider;
      return byId;
    }, {} as Record<ITransactProvider['id'], ITransactProvider>);
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

  async getDepositQuotesFor(options: TransactOption[], tokenAmount: BigNumber) {
    const quotes = await Promise.all(
      options.map(option => {
        const provider = this.providersById[option.providerId];
        return provider.getDepositQuoteFor(option, tokenAmount);
      })
    );

    return quotes.filter(quote => !!quote).flat();
  }
}
