import type { BeefyState } from '../../../redux-types';

export const selectAddToWalletStatus = (state: BeefyState) => state.ui.addToWallet.status;

export const selectAddToWalletError = (state: BeefyState) =>
  selectAddToWalletStatus(state) === 'rejected' ? state.ui.addToWallet.error : null;

export const selectAddToWalletSymbol = (state: BeefyState) =>
  selectAddToWalletStatus(state) === 'fulfilled' ? state.ui.addToWallet.token?.symbol : null;

export const selectAddToWalletIconUrl = (state: BeefyState) => state.ui.addToWallet.iconUrl;

export const selectAddToWalletToken = (state: BeefyState) => state.ui.addToWallet.token;
