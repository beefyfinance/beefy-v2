import { createSlice } from '@reduxjs/toolkit';
import { fetchApyAction } from '../actions/apy';
import { ApyData } from '../apis/beefy';
import { BoostEntity } from '../entities/boost';
import { VaultEntity } from '../entities/vault';

// boost is expressed as APR
interface AprData {
  apr: number;
}
// todo: create type guards to simplify usage

/**
 * State containing APY infos indexed by vault id
 */
export interface ApyState {
  byVaultId: {
    // we reuse the api types, not the best idea but works for now
    [vaultId: VaultEntity['id']]: ApyData;
  };
  byBoostId: {
    [boostId: BoostEntity['id']]: AprData;
  };
}
export const initialApyState: ApyState = { byVaultId: {}, byBoostId: {} };

export const apySlice = createSlice({
  name: 'apy',
  initialState: initialApyState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchApyAction.fulfilled, (sliceState, action) => {
      for (const [vaultId, apy] of Object.entries(action.payload)) {
        sliceState.byVaultId[vaultId] = apy;
      }
    });
  },
});
