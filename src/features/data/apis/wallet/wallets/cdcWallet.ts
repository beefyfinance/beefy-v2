import { makeWalletConnectWallet } from './walletConnectWallet.ts';

/** WC version */
export const cdcWallet = makeWalletConnectWallet({
  id: 'wc.cdc',
  name: 'Crypto.com Wallet',
  iconUrl: async () => (await import('../../../../../images/wallets/crypto.png')).default,
  rdns: 'com.crypto.wallet',
  deepLinks: {
    mobile: 'dfw://{uri}',
  },
});
