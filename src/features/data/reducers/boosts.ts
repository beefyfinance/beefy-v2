import { createSlice } from '@reduxjs/toolkit';
import { Boost } from '../entities/boost';
import { Vault } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type BoostsState = NormalizedEntity<Boost> & {
  // maybe make this only active boosts
  byVaultId: {
    [vaultId: Vault['id']]: Boost['id'];
  };
};
const initialState: BoostsState = { byId: {}, allIds: [], byVaultId: {} };

export const boostsSlice = createSlice({
  name: 'boosts',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {},
});
