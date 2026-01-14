import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import { metaMask, type MetaMaskParameters } from '@wagmi/connectors';
import type { UnionLooseOmit } from '../../../utils/types-utils.ts';
import { createWallet } from '../helpers.ts';

export type MetaMaskWalletOptions = BaseWalletOptions &
  UnionLooseOmit<MetaMaskParameters, 'enableAnalytics' | 'dappMetadata' | 'headless'>;

export function metaMaskWallet({
  priority,
  ...metaMaskOptions
}: MetaMaskWalletOptions = {}): WalletInit {
  return function ({ app }: WalletInitOptions) {
    return createWallet({
      id: 'metaMask',
      name: 'MetaMask',
      iconUrl: () => import('../../../../../images/wallets/metamask.svg').then(m => m.default),
      rdns: ['io.metamask'],
      hidden: false,
      ui: 'qr',
      priority,
      deepLinks: {
        mobile: '{uri}', // we get metamask:// uri from sdk, so use as is
      },
      createConnector: metaMask({
        // logging: import.meta.env.DEV ? { developerMode: true, sdk: true } : undefined,
        ...metaMaskOptions,
        enableAnalytics: false,
        headless: true,
        checkInstallationOnAllCalls: false,
        checkInstallationImmediately: false,
        shouldShimWeb3: false,
        dappMetadata: {
          url: app.url,
          name: app.name,
          iconUrl: app.icon,
        },
        openDeeplink: (_url: string) => {
          console.log('metamask', _url);
          // metamask://connect?channelId={channelId}&v=2&comm=socket&pubkey={pubKey}&t=q&originatorInfo={encrypted}
          // @dev we show qr code with button containing this url rather than trying to auto-open
        },
      }),
    });
  };
}
