import { createSlice } from '@reduxjs/toolkit';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
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
    builder.addCase(fetchVaultByChainIdAction.fulfilled, (state, action) => {
      for (const apiVault of action.payload.pools) {
        if (apiVault.isGovVault) {
          const vault: VaultGov = {
            id: apiVault.id,
            isGovVault: true,
            poolAddress: apiVault.poolAddress,
          };

          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.depositsPaused) {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        } else {
          const vault: VaultStandard = {
            id: apiVault.id,
            name: apiVault.name,
            logoUri: apiVault.logo,
            chainId: action.
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
