import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags';

// If we know the address: either from a wallet connection; or from hydration of persisted state from previous visit
export const selectIsWalletKnown = createSelector(
  (state: BeefyState) => state.user.wallet.address,
  address => address !== null
);

// If we know the address from wallet connection
export const selectIsWalletConnected = createSelector(
  (state: BeefyState) => state.user.wallet.initialized,
  (state: BeefyState) => state.user.wallet.address,
  (initialized, address) => initialized && address !== null
);

export const selectWalletAddress = createSelector(
  (state: BeefyState) => state.user.wallet.address,
  address => {
    address = featureFlag_walletAddressOverride(address);
    if (address === null) {
      throw new Error("Wallet isn't connected");
    }
    return address;
  }
);

export const selectCurrentChainId = (state: BeefyState) => state.user.wallet.selectedChainId;
export const selectIsBalanceHidden = (state: BeefyState) => state.user.wallet.hideBalance;
export const selectIsNetworkSupported = (state: BeefyState) =>
  state.user.wallet.error !== 'unsupported chain';
export const selectIsWalletInitialized = (state: BeefyState) => state.user.wallet.initialized;
