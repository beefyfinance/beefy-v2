import { createSlice } from '@reduxjs/toolkit';
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
    // todo: handle actions
  },
});
