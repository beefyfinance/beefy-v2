import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../store/types.ts';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags.ts';

// plain function: the result is a primitive, so memoizing bought nothing and the result
// function handed back its own input whenever the override flag was absent
export const selectWalletAddress = (state: BeefyState) => {
  const address = state.user.wallet.address;
  return address ? featureFlag_walletAddressOverride(address) : undefined;
};

export const selectIsWalletKnown = createSelector(selectWalletAddress, address => !!address);

// If address is actually connected
export const selectIsWalletConnected = createSelector(
  selectWalletAddress,
  (state: BeefyState) => state.user.wallet.connectedAddress,
  (address, connectedAddress) => !!connectedAddress && connectedAddress === address
);

export const selectWalletAddressOrThrow = (state: BeefyState): string => {
  const address = selectWalletAddress(state);
  if (!address) throw new Error('Wallet address not known');
  return address;
};

// TODO: remove later
export const selectWalletAddressIfKnown = selectWalletAddress;

export const selectCurrentChainId = (state: BeefyState) => state.user.wallet.selectedChainId;
export const selectIsBalanceHidden = (state: BeefyState) => state.user.wallet.hideBalance;
export const selectIsInMiniApp = (state: BeefyState) => state.user.wallet.isInMiniApp;
