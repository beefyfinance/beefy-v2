import type { BaseWalletOptions, WalletInit, WalletInitOptions } from '../wallet-types.ts';
import { type MetaMaskParameters } from '@wagmi/connectors';
import type { UnionLooseOmit } from '../../../utils/types-utils.ts';
import { createWallet } from '../helpers.ts';

export type MetaMaskWalletOptions = BaseWalletOptions &
  UnionLooseOmit<MetaMaskParameters, 'enableAnalytics' | 'dappMetadata' | 'headless'>;

export function metaMaskWallet({
  priority,
  ...metaMaskOptions
}: MetaMaskWalletOptions = {}): WalletInit {
  return async function ({ app }: WalletInitOptions) {
    const { metaMask } = await import('@wagmi/connectors');
    return createWallet({
      id: 'metaMask',
      name: 'MetaMask',
      iconUrl: () => import('../../../../../images/wallets/metamask.svg').then(m => m.default),
      rdns: ['io.metamask'],
      hidden: false,
      ui: 'qr',
      priority,
      createConnector: (...args: Parameters<ReturnType<typeof metaMask>>) => {
        console.debug('[MetaMask Wallet] Creating connector');
        const cc = metaMask({
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
            // @dev we show qr code with button containing this url rather than trying to auto-open
          },
        });
        return cc(...args);
      },
    });
  };
}
