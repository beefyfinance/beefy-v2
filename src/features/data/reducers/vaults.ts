import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { fetchAllVaults } from '../actions/vaults';
import { VaultConfig } from '../apis/config';
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

  /**
   * pricePerFullShare is how you find out how much your mooTokens
   * (shares) represent in term of the underlying asset
   *
   * So if you deposit 1 BIFI you will get, for example 0.95 mooBIFI,
   * with a ppfs of X, if you multiply your mooBIIFI * ppfs you get your amount in BIFI
   *
   * That value is fetched from the smart contract upon loading
   **/
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
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const [chainId, vaults] of Object.entries(action.payload)) {
        for (const vault of vaults) {
          addVaultToState(sliceState, chainId, vault);
        }
      }
    });

    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      for (const vaultContractData of action.payload.data.standardVaults) {
        const vaultId = vaultContractData.id;

        // only update it if needed
        if (sliceState.pricePerFullShare.byVaultId[vaultId] === undefined) {
          sliceState.pricePerFullShare.byVaultId[vaultId] = vaultContractData.pricePerFullShare;
        }
      }
    });
  },
});

function addVaultToState(
  sliceState: WritableDraft<VaultsState>,
  chainId: ChainEntity['id'],
  apiVault: VaultConfig
) {
  // we already know this vault
  if (apiVault.id in sliceState.byId) {
    return;
  }
  if (apiVault.isGovVault) {
    const vault: VaultGov = {
      id: apiVault.id,
      name: apiVault.name,
      isGovVault: true,
      earnContractAddress: apiVault.poolAddress,
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
      contractAddress: apiVault.earnContractAddress,
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
