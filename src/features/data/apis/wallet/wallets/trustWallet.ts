import { makeWalletConnectWallet } from './walletConnectWallet.ts';

/** WC version */
export const trustWallet = makeWalletConnectWallet({
  id: 'wc.trust',
  name: 'Trust Wallet',
  iconUrl: async () => (await import('../../../../../images/wallets/trust-wallet.svg')).default,
  rdns: 'com.trustwallet.app',
  deepLinks: {
    mobile: 'trust://{uri}',
  },
});
