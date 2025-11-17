import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import { type CoinbaseWalletParameters } from '@wagmi/connectors';
import { createWallet } from '../helpers.ts';

export type CoinbaseWalletOptions = BaseWalletOptions &
  Omit<CoinbaseWalletParameters<'4'>, 'appName' | 'appLogoUrl' | 'version'>;

export function coinbaseWallet({
  priority,
  ...coinbaseOptions
}: CoinbaseWalletOptions = {}): WalletInit {
  return async function ({ app }: WalletInitOptions) {
    const { coinbaseWallet } = await import('@wagmi/connectors');
    return createWallet({
      id: 'coinbaseWallet',
      name: 'Coinbase Wallet',
      iconUrl: () =>
        import('../../../../../images/wallets/coinbase-wallet.svg').then(m => m.default),
      rdns: [],
      hidden: false,
      ui: 'external',
      priority,
      createConnector: coinbaseWallet({
        ...coinbaseOptions,
        version: '4',
        appName: app.name,
        appLogoUrl: app.icon,
      }),
    });
  };
}
