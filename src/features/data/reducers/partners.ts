import { createSlice } from '@reduxjs/toolkit';
import { MoonpotConfig } from '../../../config/all-config';
import { fetchPartnersConfig } from '../actions/partners';
import { VaultEntity } from '../entities/vault';

/**
 * State containing Vault infos
 */
export type PartnersState = {
  moonpot: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: MoonpotConfig;
    };
  };
};
export const initialPartnersState: PartnersState = {
  moonpot: {
    byVaultId: {},
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
      for (const moonpotConfig of action.payload.Moonpot) {
        const vaultId = moonpotConfig.id;
        if (!sliceState.moonpot.byVaultId[vaultId]) {
          sliceState.moonpot.byVaultId[vaultId] = moonpotConfig;
        }
      }
    });
  },
});
