import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags';

export const selectIsWalletConnected = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.user.wallet.address,
  // last function receives previous function outputs as parameters
  address => address !== null
);

export const selectWalletAddress = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.user.wallet.address,
  // last function receives previous function outputs as parameters
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
