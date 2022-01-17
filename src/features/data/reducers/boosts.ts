import { createSlice } from '@reduxjs/toolkit';
import { BoostEntity } from '../entities/boost';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type BoostsState = NormalizedEntity<BoostEntity> & {
  // maybe make this only active boosts
  byVaultId: {
    [vaultId: VaultEntity['id']]: BoostEntity['id'];
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
