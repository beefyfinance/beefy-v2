import { createSlice } from '@reduxjs/toolkit';
import { fetchAnalyticsVaults } from '../actions/analytics';
import { VaultTimelineAnalyticsEntity } from '../entities/analytics';
import { VaultEntity } from '../entities/vault';

export interface AnalyticsState {
  byVaultId: { [vaultId: VaultEntity['id']]: VaultTimelineAnalyticsEntity[] };
}

const initialState: AnalyticsState = {
  byVaultId: {},
};

export const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchAnalyticsVaults.fulfilled, (sliceState, action) => {
      sliceState.byVaultId = action.payload;
    });
  },
});
