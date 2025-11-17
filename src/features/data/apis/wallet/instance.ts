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
  wallets: { initial, lazy, ...walletOptions },
  ...rest
}: WalletConnectionInitOptions) {
  if (walletConnection) {
    throw new Error('Wallet connection api already initialized.');
  }

  const [{ WalletConnectionApi }, initialWallets, lazyWallets] = await Promise.all([
    import('./wallet-connection.ts'),
    Promise.all(initial.map(walletInit => walletInit(walletOptions))),
    Promise.all(lazy.map(walletInit => walletInit(walletOptions))),
  ]);

  const options: WalletConnectionOptions = {
    ...rest,
    wallets: [...initialWallets, ...lazyWallets],
    initialWalletIds: initialWallets.map(wallet => wallet.id),
    ...walletOptions,
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
