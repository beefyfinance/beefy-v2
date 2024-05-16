import type { TokenEntity } from '../../entities/token';
import { createSlice } from '@reduxjs/toolkit';
import { fetchMerklRewardsAction } from '../../actions/rewards';
import type { Draft } from 'immer';
import type { ChainEntity } from '../../entities/chain';
import type { BigNumber } from 'bignumber.js';

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
        [vaultAddress: string]: {
          address: TokenEntity['address'];
          symbol: TokenEntity['symbol'];
          decimals: TokenEntity['decimals'];
          accumulated: BigNumber;
          unclaimed: BigNumber;
        }[];
      };
    };
  };
};

export type RewardsState = {
  byUser: {
    [userAddress: string]: {
      byProvider: {
        merkl: MerklRewardsState;
      };
    };
  };
};

const initialState: RewardsState = {
  byUser: {},
};

export const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchMerklRewardsAction.fulfilled, (sliceState, action) => {
      const userChainState = getMerklUserState(
        sliceState,
        action.payload.walletAddress,
        action.payload.chainId
      );
      userChainState.byTokenAddress = action.payload.byTokenAddress;
      userChainState.byVaultAddress = action.payload.byVaultAddress;
    });
  },
});

function getMerklUserState(
  sliceState: Draft<RewardsState>,
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

export const rewardsReducer = rewardsSlice.reducer;
