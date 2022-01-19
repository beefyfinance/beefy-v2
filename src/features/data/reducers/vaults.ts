import { createSlice } from '@reduxjs/toolkit';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  // add quick access arrays
  // todo: this probably should be split by chain
  byChainId: {
    [chainId: ChainEntity['id']]: {
      allActiveIds: VaultEntity['id'][];
      allRetiredIds: VaultEntity['id'][];
    };
  };
};
export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  byChainId: {},
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
        // we already know this vault
        if (apiVault.id in state.byId) {
          continue;
        }
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
          if (state.byChainId[vault.chainId] === undefined) {
            state.byChainId[vault.chainId] = { allActiveIds: [], allRetiredIds: [] };
          }
          if (apiVault.status === 'eol') {
            state.byChainId[vault.chainId].allRetiredIds.push(vault.id);
          } else {
            state.byChainId[vault.chainId].allActiveIds.push(vault.id);
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
          if (state.byChainId[vault.chainId] === undefined) {
            state.byChainId[vault.chainId] = { allActiveIds: [], allRetiredIds: [] };
          }
          if (apiVault.status === 'eol') {
            state.byChainId[vault.chainId].allRetiredIds.push(vault.id);
          } else {
            state.byChainId[vault.chainId].allActiveIds.push(vault.id);
          }
        }
      }
    });
  },
});
