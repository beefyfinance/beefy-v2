import { createSlice } from '@reduxjs/toolkit';
import { fetchUserMerklRewardsAction } from '../../actions/user-rewards/merkl-user-rewards.ts';
import type { Draft } from 'immer';
import type { UserRewardsState } from './user-rewards-types.ts';
import { fetchUserStellaSwapRewardsAction } from '../../actions/user-rewards/stellaswap-user-rewards.ts';

const initialState: UserRewardsState = {
  byUser: {},
};

export const userRewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUserMerklRewardsAction.fulfilled, (sliceState, action) => {
        // @dev the action already filters out rewards with 0 unclaimed
        const userState = getMerklUserState(sliceState, action.payload.walletAddress.toLowerCase());
        userState.byChainId = action.payload.byChainId;
        userState.byVaultId = action.payload.byVaultId;
      })
      .addCase(fetchUserStellaSwapRewardsAction.fulfilled, (sliceState, action) => {
        const userState = getStellaSwapUserState(
          sliceState,
          action.payload.walletAddress.toLowerCase()
        );
        userState.byVaultId = action.payload.byVaultId;
      });
  },
});

function getUserState(sliceState: Draft<UserRewardsState>, userAddress: string) {
  let userState = sliceState.byUser[userAddress];
  if (!userState) {
    userState = sliceState.byUser[userAddress] = {
      byProvider: {
        merkl: {
          byVaultId: {},
          byChainId: {},
        },
        stellaswap: {
          byVaultId: {},
        },
      },
    };
  }

  return userState;
}

function getMerklUserState(sliceState: Draft<UserRewardsState>, userAddress: string) {
  return getUserState(sliceState, userAddress).byProvider.merkl;
}

function getStellaSwapUserState(sliceState: Draft<UserRewardsState>, userAddress: string) {
  return getUserState(sliceState, userAddress).byProvider.stellaswap;
}

export const userRewardsReducer = userRewardsSlice.reducer;
