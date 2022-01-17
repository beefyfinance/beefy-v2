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
export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  allActiveIds: [],
  allRetiredIds: [],
};

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialVaultsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // TODO: WIP
    builder.addCase(fetchVaultByChainIdAction.fulfilled, (state, action) => {
      for (const apiVault of action.payload.pools) {
        const chainId = apiVault.network;
        if (apiVault.isGovVault) {
          const vault: VaultGov = {
            id: apiVault.id,
            name: apiVault.name,
            isGovVault: true,
            poolAddress: apiVault.poolAddress,
            chainId: chainId,
          };

          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.status === 'eol') {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        } else {
          const vault: VaultStandard = {
            id: apiVault.id,
            name: apiVault.name,
            logoUri: apiVault.logo,
            isGovVault: false,
            assets: apiVault.assets,
            earnedTokenId: apiVault.earnedToken,
            oracleId: apiVault.oracleId,
            strategyType: apiVault.stratType as VaultStandard['strategyType'],
            chainId: chainId,
          };
          // redux toolkit uses immer by default so we can
          // directly modify the state as usual
          state.byId[vault.id] = vault;
          state.allIds.push(vault.id);
          if (apiVault.status === 'eol') {
            state.allRetiredIds.push(vault.id);
          } else {
            state.allActiveIds.push(vault.id);
          }
        }
      }
    });
  },
});
