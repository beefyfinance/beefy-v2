import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchStandardVaultContractDataAction } from '../actions/vault-contract';
import { fetchVaultByChainIdAction } from '../actions/vaults';
import { ChainEntity } from '../entities/chain';
import { VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type VaultsState = NormalizedEntity<VaultEntity> & {
  // add quick access arrays
  byChainId: {
    [chainId: ChainEntity['id']]: {
      allActiveIds: VaultEntity['id'][];
      allRetiredIds: VaultEntity['id'][];
    };
  };
  pricePerFullShare: {
    byVaultId: {
      [vaultId: VaultEntity['id']]: BigNumber;
    };
  };
};
export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  byChainId: {},
  pricePerFullShare: { byVaultId: {} },
};

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialVaultsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchVaultByChainIdAction.fulfilled, (sliceState, action) => {
      for (const apiVault of action.payload.pools) {
        const chainId = apiVault.network;
        // we already know this vault
        if (apiVault.id in sliceState.byId) {
          continue;
        }
        if (apiVault.isGovVault) {
          const vault: VaultGov = {
            id: apiVault.id,
            name: apiVault.name,
            isGovVault: true,
            poolAddress: apiVault.poolAddress,
            excludedId: apiVault.excluded || null,
            oracleId: apiVault.oracleId,
            chainId: chainId,
          };

          sliceState.byId[vault.id] = vault;
          sliceState.allIds.push(vault.id);
          if (sliceState.byChainId[vault.chainId] === undefined) {
            sliceState.byChainId[vault.chainId] = { allActiveIds: [], allRetiredIds: [] };
          }
          if (apiVault.status === 'eol') {
            sliceState.byChainId[vault.chainId].allRetiredIds.push(vault.id);
          } else {
            sliceState.byChainId[vault.chainId].allActiveIds.push(vault.id);
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
          sliceState.byId[vault.id] = vault;
          sliceState.allIds.push(vault.id);
          if (sliceState.byChainId[vault.chainId] === undefined) {
            sliceState.byChainId[vault.chainId] = { allActiveIds: [], allRetiredIds: [] };
          }
          if (apiVault.status === 'eol') {
            sliceState.byChainId[vault.chainId].allRetiredIds.push(vault.id);
          } else {
            sliceState.byChainId[vault.chainId].allActiveIds.push(vault.id);
          }
        }
      }
    });

    builder.addCase(fetchStandardVaultContractDataAction.fulfilled, (sliceState, action) => {
      for (const vaultContractData of action.payload.data) {
        const vaultId = vaultContractData.id;

        // only update it if needed
        if (sliceState.pricePerFullShare.byVaultId[vaultId] === undefined) {
          sliceState.pricePerFullShare.byVaultId[vaultId] = vaultContractData.pricePerFullShare;
        }
      }
    });
  },
});
