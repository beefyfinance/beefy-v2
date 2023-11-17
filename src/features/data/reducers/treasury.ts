import { createSlice } from '@reduxjs/toolkit';
import { fetchTreasury } from '../actions/treasury';
import type { ChainEntity } from '../entities/chain';
import type { TreasuryHoldingEntity } from '../entities/treasury';
import BigNumber from 'bignumber.js';
import type { TreasuryHoldingConfig } from '../apis/config-types';
import { isVaultHoldingConfig } from '../apis/config-types';
import { selectIsTokenLoadedOnChain } from '../selectors/tokens';
import type { BeefyState } from '../../../redux-types';

interface AddressHolding {
  address: string;
  name: string;
  balances: { [address: string]: TreasuryHoldingEntity };
}

export interface TreasuryState {
  byChainId: {
    [chainId: ChainEntity['id']]: {
      [address: string]: AddressHolding;
    };
  };
}

export const initialState: TreasuryState = {
  byChainId: {},
};

export const treasurySlice = createSlice({
  name: 'treasury',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchTreasury.fulfilled, (sliceState, action) => {
      const { data, activeChainIds, state } = action.payload;
      for (const [chainId, balances] of Object.entries(data)) {
        if (activeChainIds.includes(chainId)) {
          const items = {};
          for (const [address, data] of Object.entries(balances)) {
            items[address] = {
              address: address,
              name: data.name,
              balances: mapBalances(state, data.balances, chainId),
            };
          }
          sliceState.byChainId[chainId] = items;
        }
      }
    });
  },
});

const mapBalances = (
  state: BeefyState,
  balances: { [address: string]: TreasuryHoldingConfig },
  chainId: ChainEntity['id']
) => {
  return Object.values(balances).reduce((totals, token) => {
    if (
      token.assetType === 'native' ||
      token.assetType === 'validator' ||
      token.assetType === 'concLiquidity' ||
      selectIsTokenLoadedOnChain(state, token.address, chainId)
    ) {
      const key = token.assetType === 'validator' ? token.id : token.address;
      totals[key] = {
        ...token,
        usdValue: new BigNumber(token.usdValue),
        balance: new BigNumber(token.balance),
        pricePerFullShare: new BigNumber(
          isVaultHoldingConfig(token) ? token.pricePerFullShare : '1'
        ),
      };
    }

    return totals;
  }, {} as Record<string, TreasuryHoldingEntity>);
};
