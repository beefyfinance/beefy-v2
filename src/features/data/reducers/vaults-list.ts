import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type VaultsListState = {
  vaultsLast: string | undefined;
  dashboardLast: string | undefined;
};

const initialState: VaultsListState = {
  vaultsLast: undefined,
  dashboardLast: undefined,
};

export const vaultsListSlice = createSlice({
  name: 'vaults-list',
  initialState,
  reducers: {
    setVaultsLast(sliceState, action: PayloadAction<string | undefined>) {
      console.debug('setVaultsLast', action.payload);
      sliceState.vaultsLast = action.payload;
    },
    setDashboardLast(sliceState, action: PayloadAction<string | undefined>) {
      console.debug('setDashboardLast', action.payload);
      sliceState.dashboardLast = action.payload;
    },
  },
});

export const { setVaultsLast, setDashboardLast } = vaultsListSlice.actions;
export const vaultsListReducer = vaultsListSlice.reducer;
