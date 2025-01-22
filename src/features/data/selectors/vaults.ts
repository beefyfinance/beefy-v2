import { createSelector } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import type { TokenEntity, TokenErc20 } from '../entities/token';
import { isTokenErc20 } from '../entities/token';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isStandardVault,
  isVaultPaused,
  isVaultPausedOrRetired,
  isVaultRetired,
  type VaultCowcentrated,
  type VaultCowcentratedLike,
  type VaultEntity,
  type VaultGov,
  type VaultGovCowcentrated,
  type VaultStandard,
  type VaultStandardCowcentrated,
} from '../entities/vault';
import {
  selectIsBeefyToken,
  selectIsTokenBluechip,
  selectIsTokenStable,
  selectTokenByIdOrUndefined,
} from './tokens';
import { createCachedSelector } from 're-reselect';
import { BIG_ONE, BIG_ZERO } from '../../../helpers/big-number';
import { differenceWith, isEqual } from 'lodash-es';
import { selectChainById } from './chains';
import { selectPlatformById } from './platforms';
import type { PlatformEntity } from '../entities/platform';
import { valueOrThrow } from '../utils/selector-utils';
import { selectVaultUnderlyingTvlUsd } from './tvl';

export const selectAllVaultIdsIncludingHidden = (state: BeefyState) => state.entities.vaults.allIds;
export const selectAllVisibleVaultIds = (state: BeefyState) => state.entities.vaults.allVisibleIds;
export const selectAllCowcentratedVaultIds = (state: BeefyState) =>
  state.entities.vaults.byType.cowcentrated.allIds;

export const selectVaultByIdOrUndefined = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.entities.vaults.byId[vaultId] || undefined;

export const selectVaultById = (state: BeefyState, vaultId: VaultEntity['id']) =>
  valueOrThrow(
    selectVaultByIdOrUndefined(state, vaultId),
    `selectVaultById: Unknown vault id ${vaultId}`
  );

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

export const selectVaultExistsById = (state: BeefyState, vaultId: VaultEntity['id']) =>
  !!state.entities.vaults.byId[vaultId];

export const selectVaultIdIgnoreCase = createSelector(
  selectAllVisibleVaultIds,
  (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId.toLowerCase(),
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

export const selectCowcentratedLikeVaultById = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultCowcentratedLike => {
  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedLikeVault(vault)) {
    throw new Error(
      `selectCowcentratedLikeVaultById: Vault ${vaultId} is not a cowcentrated-like vault`
    );
  }
  return vault;
};

export const selectCowcentratedOrCowcentratedPoolVaultById = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultCowcentrated | VaultGovCowcentrated => {
  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedVault(vault) && !isCowcentratedGovVault(vault)) {
    throw new Error(
      `selectCowcentratedOrCowcentratedPoolVaultById: Vault ${vaultId} is not a cowcentrated vault or cowcentrated pool`
    );
  }
  return vault;
};

export const selectStandardCowcentratedVaultById = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultStandardCowcentrated => {
  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedStandardVault(vault)) {
    throw new Error(
      `selectStandardCowcentratedVaultById: Vault ${vaultId} is not a cowcentrated standard vault`
    );
  }
  return vault;
};

export const selectGovCowcentratedVaultById = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): VaultGovCowcentrated => {
  const vault = selectVaultById(state, vaultId);
  if (!isCowcentratedGovVault(vault)) {
    throw new Error(
      `selectGovCowcentratedVaultById: Vault ${vaultId} is not a cowcentrated gov vault`
    );
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

export const selectVaultIdsByChainIdIncludingHidden = createSelector(
  (state: BeefyState, chainId: ChainEntity['id']) => state.entities.vaults.byChainId[chainId],
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
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.vaults.byChainId[chainId]?.byType.gov.allIds || undefined,
  (byIds, vaultIds): VaultGov[] =>
    vaultIds ? vaultIds.map(id => byIds[id]).filter(isGovVault) : []
);

export const selectAllStandardVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.vaults.byChainId[chainId]?.byType.standard.allIds || undefined,
  (byIds, vaultIds): VaultStandard[] =>
    vaultIds ? vaultIds.map(id => byIds[id]).filter(isStandardVault) : []
);

export const selectAllCowcentratedVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.vaults.byChainId[chainId]?.byType.cowcentrated.allIds || undefined,
  (byIds, vaultIds): VaultCowcentrated[] =>
    vaultIds ? vaultIds.map(id => byIds[id]).filter(isCowcentratedVault) : []
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

export const selectStandardVaultByAddressOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  contractAddress: VaultStandard['contractAddress']
) => {
  const vaultId =
    state.entities.vaults.byChainId[chainId]?.byType.standard.byAddress[
      contractAddress.toLowerCase()
    ];
  return vaultId ? selectStandardVaultById(state, vaultId) : undefined;
};

export const selectAllActiveVaultIds = (state: BeefyState) => state.entities.vaults.allActiveIds;

export const selectTotalActiveVaults = (state: BeefyState) => selectAllActiveVaultIds(state).length;

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

export const selectMaximumUnderlyingVaultTvl = (state: BeefyState) => {
  const ids = selectAllActiveVaultIds(state);
  let maxTvl = BIG_ZERO;
  for (const id of ids) {
    const underlyingTvl = selectVaultUnderlyingTvlUsd(state, id);
    if (underlyingTvl.gt(maxTvl)) {
      maxTvl = underlyingTvl;
    }
  }
  return maxTvl;
};

export const selectAllCowcentratedVaults = createSelector(
  selectAllCowcentratedVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (clmIds, vaultsById): VaultCowcentrated[] =>
    clmIds.map(id => vaultsById[id]).filter(isCowcentratedVault)
);

export const selectVaultsPinnedConfigs = (state: BeefyState) =>
  state.entities.vaults.pinned.configs;

export const selectVaultIsPinned = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.entities.vaults.pinned.byId[vaultId] || false;
