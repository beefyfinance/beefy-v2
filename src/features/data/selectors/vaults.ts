import { createSelector } from '@reduxjs/toolkit';
import { BIG_ONE } from '../../../helpers/format';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import { isGovVault, VaultEntity, VaultGov, VaultStandard } from '../entities/vault';
import { selectIsBeefyToken, selectIsTokenBluechip, selectIsTokenStable } from './tokens';

export const selectVaultById = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vaultsByIds = state.entities.vaults.byId;
  if (vaultsByIds[vaultId] === undefined) {
    throw new Error(`selectVaultById: Unknown vault id ${vaultId}`);
  }
  return vaultsByIds[vaultId];
};

export const selectGovVaultById = (state: BeefyState, vaultId: VaultEntity['id']): VaultGov => {
  const vault = selectVaultById(state, vaultId);
  if (!isGovVault(vault)) {
    throw new Error(`selectGovVaultById: Vault ${vaultId} is not a gov vault`);
  }
  return vault;
};
export const selectStandardVaultById = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultStandard => {
  const vault = selectVaultById(state, vaultId);
  if (isGovVault(vault)) {
    throw new Error(`selectStandardVaultById: Vault ${vaultId} is not a standard vault`);
  }
  return vault;
};

export const selectVaultByChainId = createSelector(
  // get a tiny bit of the data
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.vaults.byChainId[chainId],
  // last function receives previous function outputs as parameters
  vaultsChainId =>
    vaultsChainId ? vaultsChainId.allActiveIds.concat(vaultsChainId.allRetiredIds) : []
);

export const selectVaultPricePerFullShare = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.entities.vaults.contractData.byVaultId[vaultId]?.pricePerFullShare || BIG_ONE;

export const selectVaultStrategyAddress = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.entities.vaults.contractData.byVaultId[vaultId]?.strategyAddress || null;

export const selectAllGovVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  selectVaultByChainId,
  (byIds, vaultIds): VaultGov[] => {
    const allVaults = vaultIds.map(id => byIds[id]);
    return allVaults.filter(isGovVault) as VaultGov[];
  }
);

export const selectStandardVaultIdsByOracleId = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const vaultIds = state.entities.vaults.byChainId[chainId]?.standardVault.byOracleId[tokenId];
  return vaultIds || [];
};

export const selectGovVaultVaultIdsByOracleId = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const vaultIds = state.entities.vaults.byChainId[chainId]?.govVault.byOracleId[tokenId];
  return vaultIds || [];
};

export const selectIsStandardVaultEarnTokenId = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  return (
    state.entities.vaults.byChainId[chainId]?.standardVault.byEarnTokenId[tokenId] !== undefined
  );
};

export const selectStandardVaultByEarnTokenId = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenId: TokenEntity['id']
) => {
  const vaultId = state.entities.vaults.byChainId[chainId]?.standardVault.byEarnTokenId[tokenId];
  if (vaultId === undefined) {
    throw new Error(`Vault id by earn token id not found`);
  }
  return vaultId;
};

export const selectTotalActiveVaults = createSelector(
  (state: BeefyState) => state.entities.vaults.byChainId,
  byChainId => {
    let count = 0;
    for (const chainId in byChainId) {
      count = count + (byChainId[chainId]?.allActiveIds.length || 0);
    }
    return count;
  }
);

export const selectIsVaultFeatured = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.vaults.featuredVaults[vaultId],
  isFeatured => isFeatured === true
);

export const selectIsVaultBlueChip = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return vault.assetIds.every(assetId => selectIsTokenBluechip(state, assetId));
  },
  res => res
);

export const selectIsVaultStable = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return vault.assetIds.every(assetId => selectIsTokenStable(state, vault.chainId, assetId));
  },
  res => res
);

export const selectIsVaultBeefy = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);
    return vault.assetIds.some(assetId => selectIsBeefyToken(state, assetId));
  },
  res => res
);
