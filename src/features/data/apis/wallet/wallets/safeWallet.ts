import { makeWalletConnectWallet } from './walletConnectWallet.ts';

/** WC version */
export const safeWallet = makeWalletConnectWallet({
  id: 'wc.safe',
  name: 'Safe Wallet',
  iconUrl: async () => (await import('../../../../../images/wallets/safe-wallet.svg')).default,
  rdns: 'global.safe.app',
  deepLinks: {
    mobile: 'safe://{uri}',
  },
});
