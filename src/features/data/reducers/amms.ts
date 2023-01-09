import { createSlice } from '@reduxjs/toolkit';
import { fetchAllAmmsAction } from '../actions/amm';
import { ChainEntity } from '../entities/chain';
import { AmmEntity } from '../entities/amm';

export type AmmsState = {
  byId: {
    [ammId: AmmEntity['id']]: AmmEntity;
  };
  byChainId: {
    [chainId: ChainEntity['id']]: AmmEntity[];
  };
};

const initialAmmsState: AmmsState = {
  byChainId: {},
  byId: {},
};

export const ammsSlice = createSlice({
  name: 'amms',
  initialState: initialAmmsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllAmmsAction.fulfilled, (sliceState, action) => {
      for (const [chainId, amms] of Object.entries(action.payload.byChainId)) {
        sliceState.byChainId[chainId] = amms;

        for (const amm of amms) {
          if (!(amm.id in sliceState.byId)) {
            sliceState.byId[amm.id] = amm;
          } else {
            console.warn(`Duplicate amm id ${amm.id}`);
          }
        }
      }
    });
  },
});
