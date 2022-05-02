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

export const selectVaultExistsById = createSelector(
  (state: BeefyState) => state.entities.vaults.allIds,
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (allIds, vaultId): boolean => allIds.includes(vaultId)
);

export const selectVaultIdIgnoreCase = createSelector(
  (state: BeefyState) => state.entities.vaults.allIds,
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId.toLowerCase(),
  (allIds, vaultIdLowercase): VaultEntity['id'] | undefined =>
    allIds.find(id => id.toLowerCase() === vaultIdLowercase)
);

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

export const selectStandardVaultIdsByOracleAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address']
) => {
  const vaultIds =
    state.entities.vaults.byChainId[chainId]?.standardVault.byOracleTokenAddress[
      tokenAddress.toLowerCase()
    ];
  return vaultIds || [];
};

export const selectGovVaultVaultIdsByOracleAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address']
) => {
  const vaultIds =
    state.entities.vaults.byChainId[chainId]?.govVault.byOracleTokenAddress[
      tokenAddress.toLowerCase()
    ];
  return vaultIds || [];
};

export const selectIsStandardVaultEarnTokenAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address']
) => {
  return (
    state.entities.vaults.byChainId[chainId]?.standardVault.byEarnedTokenAddress[
      tokenAddress.toLowerCase()
    ] !== undefined
  );
};

export const selectStandardVaultByEarnTokenAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address']
) => {
  const vaultId =
    state.entities.vaults.byChainId[chainId]?.standardVault.byEarnedTokenAddress[
      tokenAddress.toLowerCase()
    ];
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
    return (
      vault.assetIds.every(assetId => selectIsTokenBluechip(state, assetId)) &&
      vault.assetIds.some(assetId => !selectIsTokenStable(state, vault.chainId, assetId))
    );
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
