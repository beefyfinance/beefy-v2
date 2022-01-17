import { createSlice } from '@reduxjs/toolkit';
import { fetchHistoricalApy } from '../actions/apy';
import { VaultEntity } from '../entities/vault';

/**
 * State containing APY historical infos indexed by vault id
 * Each value reprensents a timeserie data point
 * TODO: rework this state ?
 */
export interface HistoricalApyState {
  byVaultId: {
    [vaultId: VaultEntity['id']]: number[];
  };
}
const initialState: HistoricalApyState = { byVaultId: {} };

export const historicalApySlice = createSlice({
  name: 'historical_apy',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchHistoricalApy.fulfilled, (state, action) => {
      for (const [vaultId, apyPoints] of Object.entries(action.payload)) {
        state.byVaultId[vaultId] = apyPoints.map(v => parseFloat(v));
      }
    });
  },
});
