import { createSlice } from '@reduxjs/toolkit';
import { fetchTreasury } from '../actions/treasury';
import { ChainEntity } from '../entities/chain';

export interface TreasuryTokenHoldings {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  oracleId: string;
  oracleType: string;
  assetType: 'token' | 'vault';
  price: number;
  usdValue: string;
  balance: string;
}

interface AddressHolding {
  address: string;
  name: string;
  balances: { [address: string]: TreasuryTokenHoldings };
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
      console.log(action.payload);
      for (const [chainId, balances] of Object.entries(action.payload)) {
        const items = {};
        for (const [address, data] of Object.entries(balances)) {
          items[address] = {
            address: address,
            name: data.name,
            balances: data.balances,
          };
        }
        sliceState.byChainId[chainId === 'one' ? 'harmony' : chainId] = items;
      }
    });
  },
});
