import type {
  IWalletConnectionApi,
  WalletConnectionInitOptions,
  WalletConnectionOptions,
} from './wallet-connection-types.ts';

let walletConnection: IWalletConnectionApi | undefined;

export function getWalletConnectionApi() {
  if (!walletConnection) {
    throw new Error('Wallet connection api not initialized.');
  }
  return walletConnection;
}

export async function initWalletConnectionApi({
  wallets: { initial, lazy, options: initOptions, wagmi, autoConnect },
  ...rest
}: WalletConnectionInitOptions) {
  if (walletConnection) {
    throw new Error('Wallet connection api already initialized.');
  }

  const { WalletConnectionApi } = await import('./wallet-connection.ts');
  const lazyWallets = lazy.map(walletInit => walletInit(initOptions));

  const options: WalletConnectionOptions = {
    ...rest,
    wallets: [...initial, ...lazyWallets],
    wagmi,
    autoConnect,
  };

  walletConnection = new WalletConnectionApi(options);
  return walletConnection;
}

export function disposeWalletConnectionApi() {
  if (walletConnection) {
    walletConnection.dispose();
    walletConnection = undefined;
  }
}
