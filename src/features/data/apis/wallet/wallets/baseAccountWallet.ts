import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import { baseAccount, type BaseAccountParameters } from '@wagmi/connectors';
import { createWallet } from '../helpers.ts';

export type BaseAccountWalletOptions = BaseWalletOptions &
  Omit<BaseAccountParameters, 'appName' | 'appLogoUrl'>;

export function baseAccountWallet({
  priority,
  ...baseAccountOptions
}: BaseAccountWalletOptions = {}): WalletInit {
  return function ({ app }: WalletInitOptions) {
    return createWallet({
      id: 'baseAccount',
      name: 'Base Account',
      iconUrl: () => import('../../../../../images/wallets/base-account.svg').then(m => m.default),
      rdns: [],
      hidden: false,
      ui: 'external',
      priority,
      createConnector: baseAccount({
        ...baseAccountOptions,
        appName: app.name,
        appLogoUrl: app.icon,
      }),
    });
  };
}
