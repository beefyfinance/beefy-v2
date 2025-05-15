import { createSlice } from '@reduxjs/toolkit';
import { fetchPartnersConfig } from '../actions/partners.ts';
import type { PartnersState } from './partners-types.ts';

export const initialPartnersState: PartnersState = {
  qidao: {
    byVaultId: {},
  },
  nexus: {
    byChainId: {},
  },
};

export const partnersSlice = createSlice({
  name: 'partners',
  initialState: initialPartnersState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchPartnersConfig.fulfilled, (sliceState, action) => {
      for (const vaultId of action.payload.QiDao) {
        if (!sliceState.qidao.byVaultId[vaultId]) {
          sliceState.qidao.byVaultId[vaultId] = true;
        }
      }
      for (const chainId of action.payload.Nexus) {
        if (!sliceState.nexus.byChainId[chainId]) {
          sliceState.nexus.byChainId[chainId] = true;
        }
      }
    });
  },
});
