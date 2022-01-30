import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../redux/reducers/storev2';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';

export const selectVaultById = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.vaults.byId,
  // get the user passed ID
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (vaultsByIds, vaultId) => {
    if (vaultsByIds[vaultId] === undefined) {
      throw new Error(`selectVaultById: Unknown vault id ${vaultId}`);
    }
    return vaultsByIds[vaultId];
  }
);

export const selectVaultByChainId = createSelector(
  // get a tiny bit of the data
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.vaults.byChainId[chainId],
  // last function receives previous function outputs as parameters
  vaultsChainId => vaultsChainId.allActiveIds.concat(vaultsChainId.allRetiredIds)
);

export const selectVaultPricePerFullShare = createSelector(
  // get a tiny bit of the data
  (state: BeefyState) => state.entities.vaults.pricePerFullShare.byVaultId,
  // get the user passed ID
  (_: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  // last function receives previous function outputs as parameters
  (byVaultId, vaultId) => {
    if (byVaultId[vaultId] === undefined) {
      throw new Error(
        `selectVaultPricePerFullShare: Could not find contract data for vault id ${vaultId}`
      );
    }
    return byVaultId[vaultId];
  }
);

export const selectAllGovVaultsByChainId = createSelector(
  [(state: BeefyState) => state.entities.vaults.byId, selectVaultByChainId],
  (byIds, vaultIds): VaultGov[] => {
    const allVaults = vaultIds.map(id => byIds[id]);
    return allVaults.filter(isGovVault) as VaultGov[];
  }
);

export const selectAllStandardVaultsByChainId = createSelector(
  [(state: BeefyState) => state.entities.vaults.byId, selectVaultByChainId],
  (byIds, vaultIds): VaultStandard[] => {
    const allVaults = vaultIds.map(id => byIds[id]);
    return allVaults.filter(vault => !isGovVault(vault)) as VaultStandard[];
  }
);

// just a common selector to enable caching
function _selectVaultIdByOracleId(
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) {
  const byChainId = state.entities.vaults.byChainId[chainId];
  if (byChainId === undefined) {
    throw new Error(`Chain data not loaded for ${chainId}`);
  }
  return byChainId.byOracleId[tokenId];
}

export const selectIsStandardVaultOracleToken = createSelector(
  [_selectVaultIdByOracleId],
  vaultId => vaultId !== undefined
);

export const selectVaultByOracleIdTokenId = createSelector([_selectVaultIdByOracleId], vaultId => {
  if (vaultId === undefined) {
    throw new Error(`Vault id by oracle id not found`);
  }
  return vaultId;
});

// just a common selector to enable caching
function _selectVaultIdByEarnTokenId(
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) {
  const byChainId = state.entities.vaults.byChainId[chainId];
  if (byChainId === undefined) {
    throw new Error(`Chain data not loaded for ${chainId}`);
  }
  return byChainId.byEarnTokenId[tokenId];
}

export const selectIsStandardVaultEarnTokenId = createSelector(
  [_selectVaultIdByEarnTokenId],
  vaultId => vaultId !== undefined
);

export const selectVaultByEarnTokenId = createSelector([_selectVaultIdByEarnTokenId], vaultId => {
  if (vaultId === undefined) {
    throw new Error(`Vault id by earn token id not found`);
  }
  return vaultId;
});
