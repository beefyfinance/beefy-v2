import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags';

// If we know the address: either from a wallet connection; or from hydration of persisted state from previous visit
export const selectIsWalletKnown = createSelector(
  (state: BeefyState) => state.user.wallet.address,
  address => address !== null
);

// If address is actually connected
export const selectIsWalletConnected = createSelector(
  (state: BeefyState) => state.user.wallet.connectedAddress,
  (state: BeefyState) => state.user.wallet.address,
  (connectedAddress, address) => connectedAddress !== null && connectedAddress === address
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

export const selectWalletAddressIfKnown = createSelector(
  (state: BeefyState) => state.user.wallet.address,
  (state: BeefyState) => selectIsWalletKnown(state),
  (address, isKnown) => (isKnown ? address : null)
);

export const selectCurrentChainId = (state: BeefyState) => state.user.wallet.selectedChainId;
export const selectIsBalanceHidden = (state: BeefyState) => state.user.wallet.hideBalance;
export const selectIsNetworkSupported = (state: BeefyState) =>
  state.user.wallet.error !== 'unsupported chain';
export const selectIsWalletInitialized = (state: BeefyState) => state.user.wallet.initialized;
export const selectEns = (state: BeefyState) => state.user.wallet.ens;
