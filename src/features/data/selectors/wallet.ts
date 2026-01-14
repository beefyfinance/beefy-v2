import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';

/** wallet address or undefined (does not necessarily mean wallet is connected) */
export const selectWalletAddress = (state: BeefyState) => state.user.wallet.address;
/** wallet address or throw (does not necessarily mean wallet is connected) */
export const selectWalletAddressOrThrow = (state: BeefyState) =>
  valueOrThrow(state.user.wallet.address);
/** true if wallet address or false if undefined (does not necessarily mean wallet is connected) */
export const selectIsWalletKnown = (state: BeefyState) => !!selectWalletAddress(state);
/** if we have wallet connection (not just address known) */
export const selectIsWalletConnected = (state: BeefyState) => state.user.wallet.account.isConnected;

export const selectCurrentChainId = (state: BeefyState) => state.user.wallet.account.chainId;
export const selectIsBalanceHidden = (state: BeefyState) => state.user.wallet.settings.hideBalance;
export const selectIsInMiniApp = (state: BeefyState) => state.user.wallet.isInMiniApp;

export const selectWalletAccount = (state: BeefyState) => state.user.wallet.account;

export const selectWalletRecent = (state: BeefyState) => state.user.wallet.recent;

export const selectWalletOptions = (state: BeefyState) => state.user.wallet.options;
export const selectWalletSelect = (state: BeefyState) => state.user.wallet.select;
export const selectWalletSelectOpen = (state: BeefyState) => state.user.wallet.select.open;
export const selectWalletSelectActive = (state: BeefyState) => {
  if (
    !state.user.wallet.select.open ||
    (state.user.wallet.select.step !== 'connecting' && state.user.wallet.select.step !== 'error')
  ) {
    return undefined;
  }
  return state.user.wallet.select.wallet.id;
};
