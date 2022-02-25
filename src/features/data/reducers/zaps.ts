import { createSlice } from '@reduxjs/toolkit';
import { fetchAllZapsAction } from '../actions/zap';
import { ChainEntity } from '../entities/chain';
import { ZapEntity } from '../entities/zap';

/**
 * State containing Vault infos
 */
export type ZapsState = {
  byChainId: {
    [chainId: ChainEntity['id']]: ZapEntity[];
  };
};
const initialZapsState: ZapsState = {
  byChainId: {},
};

export const zapsSlice = createSlice({
  name: 'zaps',
  initialState: initialZapsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllZapsAction.fulfilled, (sliceState, action) => {
      sliceState.byChainId = action.payload.byChainId;
    });
  },
});
