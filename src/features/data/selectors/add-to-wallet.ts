import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';

export const selectAddToWalletStatus = (state: BeefyState) => state.ui.addToWallet.status;

export const selectAddToWalletError = (state: BeefyState) =>
  selectAddToWalletStatus(state) === 'rejected' ? state.ui.addToWallet.error : null;

export const selectAddToWalletSymbol = (state: BeefyState) =>
  selectAddToWalletStatus(state) === 'fulfilled' ? state.ui.addToWallet.token?.symbol : null;

export const selectAddToWalletIconUrl = (state: BeefyState) => state.ui.addToWallet.iconUrl;

export const selectAddToWalletToken = (state: BeefyState) =>
  valueOrThrow(state.ui.addToWallet.token, 'Add to wallet token not set');
