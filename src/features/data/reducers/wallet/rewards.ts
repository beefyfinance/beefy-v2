import type { TokenEntity } from '../../entities/token';
import { createSlice } from '@reduxjs/toolkit';
import { fetchUserMerklRewardsAction } from '../../actions/user-rewards';
import type { Draft } from 'immer';
import type { ChainEntity } from '../../entities/chain';
import type { BigNumber } from 'bignumber.js';

export type MerklVaultReward = {
  address: TokenEntity['address'];
  symbol: TokenEntity['symbol'];
  decimals: TokenEntity['decimals'];
  accumulated: BigNumber;
  unclaimed: BigNumber;
};

export type MerklRewardsState = {
  byChain: {
    [chainId in ChainEntity['id']]?: {
      byTokenAddress: {
        [tokenAddress: string]: {
          accumulated: BigNumber;
          decimals: number;
          address: string;
          symbol: string;
          unclaimed: BigNumber;
          reasons: {
            id: string;
            accumulated: BigNumber;
            unclaimed: BigNumber;
          }[];
          proof: string[];
        };
      };
      byVaultAddress: {
        [vaultAddress: string]: MerklVaultReward[];
      };
    };
  };
};

export type UserRewardsState = {
  byUser: {
    [userAddress: string]: {
      byProvider: {
        merkl: MerklRewardsState;
      };
    };
  };
};

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
    builder.addCase(fetchUserMerklRewardsAction.fulfilled, (sliceState, action) => {
      // @dev the action already filters out rewards with 0 unclaimed
      const userChainState = getMerklUserState(
        sliceState,
        action.payload.walletAddress.toLowerCase(),
        action.payload.chainId
      );
      userChainState.byTokenAddress = action.payload.byTokenAddress;
      userChainState.byVaultAddress = action.payload.byVaultAddress;
    });
  },
});

function getMerklUserState(
  sliceState: Draft<UserRewardsState>,
  userAddress: string,
  chainId: ChainEntity['id']
) {
  let userState = sliceState.byUser[userAddress];
  if (!userState) {
    userState = sliceState.byUser[userAddress] = {
      byProvider: {
        merkl: {
          byChain: {},
        },
      },
    };
  }

  let chainState = userState.byProvider.merkl.byChain[chainId];
  if (!chainState) {
    chainState = sliceState.byUser[userAddress].byProvider.merkl.byChain[chainId] = {
      byTokenAddress: {},
      byVaultAddress: {},
    };
  }

  return chainState;
}

export const userRewardsReducer = userRewardsSlice.reducer;
