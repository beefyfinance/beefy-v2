import type { BeefyState } from '../store/types.ts';
import { featureFlag_walletAddressOverride } from '../utils/feature-flags.ts';
import { createBoundedSelector } from '../utils/selector-utils.ts';

// @dev on hotpath so 1 slot cache to stop featureFlag_walletAddressOverride being called
export const selectWalletAddress = createBoundedSelector(
  (state: BeefyState) => state.user.wallet.address,
  address => (address ? featureFlag_walletAddressOverride(address) : undefined)
);

export const selectIsWalletKnown = (state: BeefyState) => !!selectWalletAddress(state);

// If address is actually connected
export const selectIsWalletConnected = (state: BeefyState) => {
  const connectedAddress = state.user.wallet.connectedAddress;
  return !!connectedAddress && connectedAddress === selectWalletAddress(state);
};

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
