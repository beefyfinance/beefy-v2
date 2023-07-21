import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type TooltipsState = {
  byGroup: Record<string, string>;
};

export const initialState: TooltipsState = {
  byGroup: {
    default: '',
  },
};

export const tooltipsSlice = createSlice({
  name: 'tooltips',
  initialState: initialState,
  reducers: {
    openTooltip(sliceState, action: PayloadAction<{ group: string; id: string }>) {
      sliceState.byGroup[action.payload.group] = action.payload.id;
    },
    closeTooltip(sliceState, action: PayloadAction<{ group: string; id: string }>) {
      if (sliceState.byGroup[action.payload.group] === action.payload.id) {
        sliceState.byGroup[action.payload.group] = '';
      }
    },
  },
});

export const { openTooltip, closeTooltip } = tooltipsSlice.actions;
