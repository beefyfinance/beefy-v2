import type {
  BaseWalletOptions,
  CreateWalletParams,
  WalletInit,
  WalletInitOptions,
} from '../wallet-types.ts';
import { createWallet, normalizeRdns } from '../helpers.ts';

export type MakeWalletConnectWalletOptions = Omit<
  CreateWalletParams,
  'createConnector' | 'rdns'
> & {
  customStoragePrefix?: string;
  rdns?: string;
  priority?: number;
};

export type WalletConnectWalletOptions = BaseWalletOptions & {
  projectId: string;
};

export function makeWalletConnectWallet({
  customStoragePrefix,
  rdns,
  ...rest
}: MakeWalletConnectWalletOptions): (opts: WalletConnectWalletOptions) => WalletInit {
  return function walletConnectWallet({ projectId }: WalletConnectWalletOptions): WalletInit {
    return async function ({ app }: WalletInitOptions) {
      const { walletConnect } = await import('@wagmi/connectors');
      const createConnector = walletConnect({
        projectId,
        isNewChainsStale: true,
        customStoragePrefix: customStoragePrefix ?? rest.id,
        showQrModal: false,
        metadata: {
          name: app.name,
          description: app.description,
          url: app.url,
          icons: [app.icon],
        },
      });

      return createWallet({
        ...rest,
        rdns: normalizeRdns(rdns),
        ui: 'qr',
        createConnector: (...params: Parameters<typeof createConnector>) => {
          const connector = createConnector(...params);
          // we set the id so each wallet connect connector is unique (rather than 'walletConnect')
          // @dev these are readonly, and we can't spread due to bound getters
          Object.defineProperties(connector, {
            id: { value: rest.id },
            name: { value: rest.name },
            rdns: { value: normalizeRdns(rdns) },
          });
          return connector;
        },
      });
    };
  };
}

export const walletConnectWallet = makeWalletConnectWallet({
  id: 'walletConnect',
  name: 'WalletConnect',
  iconUrl: async () => (await import('../../../../../images/wallets/wallet-connect.svg')).default,
});
