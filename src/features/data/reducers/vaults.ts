import { createSlice } from '@reduxjs/toolkit';
import { fetchVaultListAction } from '../actions/prices';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  // add quick access arrays
  // todo: this probably should be split by chain
  allActiveIds: VaultEntity['id'][];
  allRetiredIds: VaultEntity['id'][];
};
const initialState: VaultsState = { byId: {}, allIds: [], allActiveIds: [], allRetiredIds: [] };

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // TODO: WIP
    builder.addCase(fetchVaultListAction.fulfilled, (state, action) => {
      for (const apiVault of action.payload.pools) {
        if (apiVault.isGovVault) {
          // @ts-ignore
          const vault: VaultGov = {
            id: apiVault.id,
            //...
          };

          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.depositsPaused) {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        } else {
          // @ts-ignore
          const vault: VaultLP = {
            //...
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.depositsPaused) {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        }
      }
    });
  },
});
