import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenErc20 } from '../entities/token';
import { isTokenErc20 } from '../entities/token';
import {
  isCowcentratedVault,
  isGovVault,
  isMultiGovVault,
  isStandardVault,
  isVaultPaused,
  isVaultPausedOrRetired,
  isVaultRetired,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../entities/vault';
import {
  selectIsBeefyToken,
  selectIsTokenBluechip,
  selectIsTokenStable,
  selectTokenByIdOrUndefined,
} from './tokens';
import { createCachedSelector } from 're-reselect';
import { BIG_ONE } from '../../../helpers/big-number';
import { differenceWith, isEqual } from 'lodash-es';
import { selectChainById } from './chains';
import { selectPlatformById } from './platforms';
import type { PlatformEntity } from '../entities/platform';
import { valueOrThrow } from '../utils/selector-utils';

export const selectAllVaultIds = (state: BeefyState) => state.entities.vaults.allIds;

export const selectVaultById = createCachedSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (vaultsById, vaultId) => {
    const vault = vaultsById[vaultId];
    if (vault === undefined) {
      throw new Error(`selectVaultById: Unknown vault id ${vaultId}`);
    }
    return vault;
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultByAddressOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['contractAddress']
): VaultEntity | undefined => {
  const id =
    state.entities.vaults.byChainId[chainId]?.byAddress[vaultAddress.toLowerCase()] || undefined;
  return id ? selectVaultById(state, id) : undefined;
};

export const selectVaultByAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['contractAddress']
): VaultEntity => valueOrThrow(selectVaultByAddressOrUndefined(state, chainId, vaultAddress));

/** The id of the vault whose contract address is equal to the deposit token address of the passed vault id */
export const selectVaultUnderlyingVaultIdOrUndefined = (
  state: BeefyState,
  parentVaultId: VaultEntity['id']
): VaultEntity['id'] | undefined => {
  return state.entities.vaults.relations.underlyingOf.byId[parentVaultId] || undefined;
};

/** The vault whose contract address is equal to the deposit token address of the passed vault id */
export const selectVaultUnderlyingVaultOrUndefined = (
  state: BeefyState,
  parentVaultId: VaultEntity['id']
): VaultEntity | undefined => {
  const underlyingId = selectVaultUnderlyingVaultIdOrUndefined(state, parentVaultId);
  return underlyingId ? selectVaultById(state, underlyingId) : undefined;
};

/** The vault whose contract address is equal to the deposit token address of the passed vault id */
export const selectVaultUnderlyingVault = (
  state: BeefyState,
  parentVaultId: VaultEntity['id']
): VaultEntity => valueOrThrow(selectVaultUnderlyingVaultOrUndefined(state, parentVaultId));

/** The id of the cowcentrated vault whose contract address is equal to the deposit token address of the passed vault id */
export const selectVaultUnderlyingCowcentratedVaultIdOrUndefined = (
  state: BeefyState,
  parentVaultId: VaultEntity['id']
): VaultEntity['id'] | undefined => {
  return (
    state.entities.vaults.relations.underlyingOf.byType.cowcentrated.byId[parentVaultId] ||
    undefined
  );
};

/** The cowcentrated vault whose contract address is equal to the deposit token address of the passed vault id */
export const selectVaultUnderlyingCowcentratedVaultOrUndefined = (
  state: BeefyState,
  parentVaultId: VaultEntity['id']
): VaultCowcentrated | undefined => {
  const underlyingId = selectVaultUnderlyingCowcentratedVaultIdOrUndefined(state, parentVaultId);
  return underlyingId ? selectCowcentratedVaultById(state, underlyingId) : undefined;
};

/** The cowcentrated vault whose contract address is equal to the deposit token address of the passed vault id */
export const selectVaultUnderlyingCowcentratedVault = (
  state: BeefyState,
  parentVaultId: VaultEntity['id']
): VaultCowcentrated =>
  valueOrThrow(selectVaultUnderlyingCowcentratedVaultOrUndefined(state, parentVaultId));

/** vault ids for which this vault is used as the deposit token for  */
export const selectVaultParentVaultIdsOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultEntity['id'][] | undefined => {
  return state.entities.vaults.relations.depositFor.byId[vaultId] || undefined;
};

/** standard vault ids for which this vault is used as the deposit token for  */
export const selectVaultParentStandardVaultIdsOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultEntity['id'][] | undefined => {
  return state.entities.vaults.relations.depositFor.byType.standard.byId[vaultId] || undefined;
};

/** gov vault ids for which this vault is used as the deposit token for  */
export const selectVaultParentGovVaultIdsOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultEntity['id'][] | undefined => {
  return state.entities.vaults.relations.depositFor.byType.gov.byId[vaultId] || undefined;
};

/** cowcentrated vault ids for which this vault is used as the deposit token for  */
export const selectVaultParentCowcentratedVaultIdsOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultEntity['id'][] | undefined => {
  return state.entities.vaults.relations.depositFor.byType.cowcentrated.byId[vaultId] || undefined;
};

/** if this vault is used as the deposit token for another vault */
export const selectVaultIsUnderlyingVault = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): boolean => {
  const parentIds = selectVaultParentVaultIdsOrUndefined(state, vaultId);
  return parentIds ? parentIds.length > 0 : false;
};

/** if this vault is used as the deposit token for another gov vault */
export const selectVaultIsUnderlyingVaultOfGov = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): boolean => {
  const parentIds = selectVaultParentGovVaultIdsOrUndefined(state, vaultId);
  return parentIds ? parentIds.length > 0 : false;
};

export const selectIsVaultPausedOrRetired = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultPausedOrRetired(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultPaused = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultPaused(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultRetired = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultRetired(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultCowcentrated = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isCowcentratedVault(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

/**
 * @return 'cowcentrated' if CLM; 'gov' if reward pool with underlying CLM; false otherwise
 */
export const selectIsVaultCowcentratedLike = createCachedSelector(
  selectVaultById,
  selectVaultUnderlyingCowcentratedVaultIdOrUndefined,
  (vault, underlyingCowcentratedId) => {
    if (isCowcentratedVault(vault)) {
      return vault.type;
    }
    if (!underlyingCowcentratedId) {
      return false;
    }
    if (isMultiGovVault(vault)) {
      return vault.type;
    }
    return false;
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultGov = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isGovVault(vault)
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultType = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => vault.type
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectCowcentratedVaultDepositTokenAddresses = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectCowcentratedVaultById(state, vaultId),
  vault => vault.depositTokenAddresses
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

export const selectCowcentratedVaultById = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultCowcentrated => {
  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedVault(vault)) {
    throw new Error(`selectCowcentratedVaultById: Vault ${vaultId} is not a cowcentrated vault`);
  }
  return vault;
};

export const selectStandardVaultById = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  standardVault => {
    if (!isStandardVault(standardVault)) {
      throw new Error(`selectStandardVaultById: Vault ${standardVault.id} is not a standard vault`);
    }
    return standardVault;
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectStandardOrCowcentratedVaultById = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => {
    if (!isStandardVault(vault) && !isCowcentratedVault(vault)) {
      throw new Error(
        `selectStandardOrCowcentratedVaultById: Vault ${vault.id} is not a standard or cowcentrated vault`
      );
    }
    return vault;
  }
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultIdsByChainId = createSelector(
  // get a tiny bit of the data
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.vaults.byChainId[chainId],
  // last function receives previous function outputs as parameters
  vaultsChainId => (vaultsChainId ? vaultsChainId.allIds : [])
);

export const selectVaultPricePerFullShare = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.vaults.contractData.byVaultId[vaultId]?.pricePerFullShare,
  price => price || BIG_ONE
);

export const selectVaultStrategyAddress = (state: BeefyState, vaultId: VaultEntity['id']) =>
  valueOrThrow(
    state.entities.vaults.contractData.byVaultId[vaultId]?.strategyAddress,
    `Vault ${vaultId} has no strategy address`
  );

export const selectVaultStrategyAddressOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  return state.entities.vaults.contractData.byVaultId[vaultId]?.strategyAddress;
};

export const selectAllGovVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  selectVaultIdsByChainId,
  (byIds, vaultIds): VaultGov[] => vaultIds.map(id => byIds[id]).filter(isGovVault)
);

export const selectAllStandardVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  selectVaultIdsByChainId,
  (byIds, vaultIds): VaultStandard[] => vaultIds.map(id => byIds[id]).filter(isStandardVault)
);

export const selectAllCowcentratedVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  selectVaultIdsByChainId,
  (byIds, vaultIds): VaultCowcentrated[] =>
    vaultIds.map(id => byIds[id]).filter(isCowcentratedVault)
);

export const selectNonGovVaultIdsByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    tokenAddress.toLowerCase(),
  (state: BeefyState, _chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byChainId,
  (chainId, tokenAddress, byChainId) =>
    (byChainId[chainId]?.byType.standard.byDepositTokenAddress[tokenAddress] || []).concat(
      byChainId[chainId]?.byType.cowcentrated.byDepositTokenAddress[tokenAddress] || []
    )
)(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

export const selectFirstNonGovVaultByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    selectNonGovVaultIdsByDepositTokenAddress(state, chainId, tokenAddress),
  (state: BeefyState, _chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byId,
  (ids, byId) => (ids.length > 0 && !!ids[0] ? byId[ids[0]] : undefined)
)(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

export const selectGovVaultVaultIdsByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) => chainId,
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    tokenAddress.toLowerCase(),
  (state: BeefyState, _chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byChainId,
  (chainId, tokenAddress, byChainId) =>
    byChainId[chainId]?.byType.gov.byDepositTokenAddress[tokenAddress] || []
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
    state.entities.vaults.byChainId[chainId]?.byType.standard.byAddress[
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
    state.entities.vaults.byChainId[chainId]?.byType.standard.byAddress[tokenAddress.toLowerCase()];
  if (vaultId === undefined) {
    throw new Error(`Vault id by earn token id not found`);
  }
  return vaultId;
};

export const selectTotalActiveVaults = (state: BeefyState) =>
  state.entities.vaults.allActiveIds.length;
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

export const selectIsVaultCorrelated = createSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => {
    const vault = selectVaultById(state, vaultId);

    return (
      vault.risks.includes('IL_NONE') &&
      vault.assetIds.length > 1 &&
      !selectIsVaultStable(state, vaultId)
    );
  },
  res => res
);

export const selectVaultName = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => state.entities.vaults.byId[vaultId],
  (vault: VaultEntity) => vault.name
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultDepositFee = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.depositFee;
};

export const selectVaultLastHarvestByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.entities.vaults.lastHarvestById,
  (state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (lastHarvestById, vaultId) => lastHarvestById[vaultId] || 0
)((state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectAllVaultIdsWithBridgedVersion = (state: BeefyState) =>
  state.entities.vaults.allBridgedIds;

export const selectAllVaultsWithBridgedVersion = (state: BeefyState) =>
  selectAllVaultIdsWithBridgedVersion(state).map(id => selectVaultById(state, id));

export const selectVaultHasAssetsWithRisks = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): { risks: false } | { risks: true; tokens: TokenErc20[] } => {
  const vault = selectVaultById(state, vaultId);

  const tokensWithRisks: TokenErc20[] = [];

  for (const tokenId of vault.assetIds) {
    const token = selectTokenByIdOrUndefined(state, vault.chainId, tokenId);

    if (token && isTokenErc20(token) && (token?.risks?.length || 0) > 0) {
      tokensWithRisks.push(token);
    }
  }

  if (tokensWithRisks.length >= 1) {
    return {
      risks: true,
      tokens: tokensWithRisks,
    };
  }

  // by default return false
  return {
    risks: false,
  };
};

export const selectVaultHasPlatformWithRisks = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): { risks: false } | { risks: true; platform: PlatformEntity } => {
  const vault = selectVaultById(state, vaultId);

  const platform = selectPlatformById(state, vault.platformId);

  if ((platform?.risks?.length || 0) > 0) {
    return {
      risks: true,
      platform,
    };
  } else {
    return { risks: false };
  }
};

export const selectChainsHasCowcentratedVaults = (state: BeefyState, chainId: ChainEntity['id']) =>
  (state.entities.vaults.byChainId[chainId]?.byType.cowcentrated.allIds.length || 0) > 0;
