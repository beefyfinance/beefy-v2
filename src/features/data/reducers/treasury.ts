import { createSlice } from '@reduxjs/toolkit';
import { fetchTreasury } from '../actions/treasury';
import { ChainEntity } from '../entities/chain';
import { TreasuryHoldingEntity } from '../entities/treasury';
import { mapValues } from 'lodash';
import BigNumber from 'bignumber.js';
import { isVaultHoldingConfig } from '../apis/config-types';

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
      const { data, allChainIds } = action.payload;
      for (const [_chainId, balances] of Object.entries(data)) {
        const items = {};

        for (const [address, data] of Object.entries(balances)) {
          items[address] = {
            address: address,
            name: data.name,
            balances: mapValues(data.balances, balance => ({
              ...balance,
              usdValue: new BigNumber(balance.usdValue),
              balance: new BigNumber(balance.balance),
              pricePerFullShare: new BigNumber(
                isVaultHoldingConfig(balance) ? balance.pricePerFullShare : '1'
              ),
            })),
          };
        }

        const chainId = _chainId === 'one' ? 'harmony' : _chainId;
        if (allChainIds.includes(chainId)) {
          sliceState.byChainId[chainId] = items;
        }
      }
    });
  },
});
