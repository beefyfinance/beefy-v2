import { createSlice } from '@reduxjs/toolkit';

export type UIThemeState = {
  nightMode: boolean;
};
export const initialUIThemeState: UIThemeState = {
  nightMode: true,
};

export const uiThemeSlice = createSlice({
  name: 'ui-theme',
  initialState: initialUIThemeState,
  reducers: {
    toggleNightMode(sliceState) {
      sliceState.nightMode = !sliceState.nightMode;
    },
  },
});

export const { toggleNightMode } = uiThemeSlice.actions;
