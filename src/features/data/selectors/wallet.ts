import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers';

export const selectIsWalletConnected = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.user.wallet.address,
  // last function receives previous function outputs as parameters
  address => address !== null
);

export const selectWalletAddress = createSelector(
  // get a tiny bit of the data
  (store: BeefyState) => store.user.wallet.address,
  // last function receives previous function outputs as parameters
  address => {
    if (address === null) {
      throw new Error("Wallet isn't connected");
    }
    return address;
  }
);
