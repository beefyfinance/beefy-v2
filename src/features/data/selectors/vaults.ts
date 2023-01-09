import { createSelector } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { TokenEntity } from '../entities/token';
import {
  isGovVault,
  isVaultPausedOrRetired,
  isVaultRetired,
  VaultEntity,
  VaultGov,
} from '../entities/vault';
import { selectIsBeefyToken, selectIsTokenBluechip, selectIsTokenStable } from './tokens';
import { createCachedSelector } from 're-reselect';
import { BIG_ONE } from '../../../helpers/big-number';
import { differenceWith, first, isEqual } from 'lodash';
import { selectChainById } from './chains';

export const selectVaultById = createCachedSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (vaultsById, vaultId) => {
    if (vaultsById[vaultId] === undefined) {
      throw new Error(`selectVaultById: Unknown vault id ${vaultId}`);
    }
    return vaultsById[vaultId];
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultPausedOrRetired = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultPausedOrRetired(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultRetired = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultRetired(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultGov = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isGovVault(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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

export const selectStandardVaultById = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  standarVault => {
    if (isGovVault(standarVault)) {
      throw new Error(`selectStandardVaultById: Vault ${standarVault.id} is not a standard vault`);
    }
    return standarVault;
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultByChainId = createSelector(
  // get a tiny bit of the data
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.vaults.byChainId[chainId],
  // last function receives previous function outputs as parameters
  vaultsChainId =>
    vaultsChainId ? vaultsChainId.allActiveIds.concat(vaultsChainId.allRetiredIds) : []
);

export const selectVaultPricePerFullShare = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.vaults.contractData.byVaultId[vaultId]?.pricePerFullShare,
  price => price || BIG_ONE
);

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

export const selectStandardVaultIdsByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    tokenAddress.toLowerCase(),
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byChainId,
  (chainId, tokenAddress, byChainId) =>
    byChainId[chainId]?.standardVault.byDepositTokenAddress[tokenAddress] || []
)(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

export const selectFirstStandardVaultByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    selectStandardVaultIdsByDepositTokenAddress(state, chainId, tokenAddress),
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byId,
  (ids, byId) => (ids.length ? byId[first(ids)] : null)
)(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

export const selectGovVaultVaultIdsByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    tokenAddress.toLowerCase(),
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byChainId,
  (chainId, tokenAddress, byChainId) =>
    byChainId[chainId]?.govVault.byDepositTokenAddress[tokenAddress] || []
)(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

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
    const chain = selectChainById(state, vault.chainId);
    const nonStables = differenceWith(vault.assetIds, chain.stableCoins, isEqual);
    return (
      nonStables.length > 0 &&
      nonStables.every(tokenId => {
        return selectIsTokenBluechip(state, tokenId);
      })
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

export const selectVaultName = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.vaults.byId[vaultId],
  (vault: VaultEntity) => vault.name
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultDepositFee = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.vaults.byId[vaultId].depositFee,
  (fee: string) => fee || '0%'
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);
