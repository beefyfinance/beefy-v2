import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import { BIG_ONE } from '../../../helpers/big-number.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import {
  getCowcentratedPool,
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isErc4626Vault,
  isGovVault,
  isStandardVault,
  isVaultPaused,
  isVaultPausedOrRetired,
  isVaultRetired,
  isVaultWithReceipt,
  shouldVaultShowInterest,
  type VaultCowcentrated,
  type VaultCowcentratedLike,
  type VaultEntity,
  type VaultErc4626,
  type VaultGov,
  type VaultGovCowcentrated,
  type VaultStandard,
  type VaultStandardCowcentrated,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { featureFlag_disableRedirect } from '../utils/feature-flags.ts';
import { arrayOrStaticEmpty, valueOrThrow } from '../utils/selector-utils.ts';
import { selectIsConfigAvailable } from './config.ts';

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

export const selectVaultByIdWithReceiptOrUndefined = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => {
  const vault = state.entities.vaults.byId[vaultId] || undefined;
  if (vault && isVaultWithReceipt(vault)) {
    return vault;
  }
  return undefined;
};

export const selectVaultByIdWithReceipt = (state: BeefyState, vaultId: VaultEntity['id']) =>
  valueOrThrow(
    selectVaultByIdWithReceiptOrUndefined(state, vaultId),
    `selectVaultByIdWithReceipt: Unknown vault id ${vaultId} or not a vault with a receipt`
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
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultPaused = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultPaused(vault)
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultRetired = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isVaultRetired(vault)
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultCowcentrated = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isCowcentratedVault(vault)
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectIsVaultGov = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => isGovVault(vault)
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultType = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => vault.type
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectCowcentratedVaultDepositTokenAddresses = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectCowcentratedVaultById(state, vaultId),
  vault => vault.depositTokenAddresses
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultExistsById = (state: BeefyState, vaultId: VaultEntity['id']) =>
  !!state.entities.vaults.byId[vaultId];

export const selectVaultByIdCaseInsensitiveOrUndefined = createSelector(
  (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  selectAllVaultIdsIncludingHidden,
  (state: BeefyState) => state.entities.vaults.byId,
  (vaultId, allIds, byId): VaultEntity | undefined => {
    const exactMatch = byId[vaultId];
    if (exactMatch) {
      return exactMatch;
    }
    const vaultIdLowercase = vaultId.toLowerCase();
    const matchingId = allIds.find(id => id.toLowerCase() === vaultIdLowercase);
    return matchingId ? byId[matchingId] : undefined;
  }
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
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectErc4626VaultById = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  vault => {
    if (!isErc4626Vault(vault)) {
      throw new Error(`selectErc4626VaultById: Vault ${vault.id} is not a erc4626 vault`);
    }
    return vault;
  }
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

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
    vaultIds ? vaultIds.map(id => byIds[id]!).filter(isGovVault) : []
);

export const selectAllStandardVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.vaults.byChainId[chainId]?.byType.standard.allIds || undefined,
  (byIds, vaultIds): VaultStandard[] =>
    vaultIds ? vaultIds.map(id => byIds[id]!).filter(isStandardVault) : []
);

export const selectAllCowcentratedVaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.vaults.byChainId[chainId]?.byType.cowcentrated.allIds || undefined,
  (byIds, vaultIds): VaultCowcentrated[] =>
    vaultIds ? vaultIds.map(id => byIds[id]!).filter(isCowcentratedVault) : []
);

export const selectAllErc4626VaultsByChainId = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState, chainId: ChainEntity['id']) =>
    state.entities.vaults.byChainId[chainId]?.byType.erc4626.allIds || undefined,
  (byIds, vaultIds): VaultErc4626[] =>
    vaultIds ? vaultIds.map(id => byIds[id]!).filter(isErc4626Vault) : []
);

export const selectNonGovVaultIdsByDepositTokenAddress = createCachedSelector(
  (_state: BeefyState, chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) =>
    chainId,
  (_state: BeefyState, _chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    tokenAddress.toLowerCase(),
  (state: BeefyState, _chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byChainId,
  (chainId, tokenAddress, byChainId) =>
    arrayOrStaticEmpty(
      (byChainId[chainId]?.byType.standard.byDepositTokenAddress[tokenAddress] || [])
        .concat(byChainId[chainId]?.byType.cowcentrated.byDepositTokenAddress[tokenAddress] || [])
        .concat(byChainId[chainId]?.byType.erc4626.byDepositTokenAddress[tokenAddress] || [])
    )
)(
  (_state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

export const selectFirstNonGovVaultByDepositTokenAddress = createCachedSelector(
  (state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    selectNonGovVaultIdsByDepositTokenAddress(state, chainId, tokenAddress),
  (state: BeefyState, _chainId: ChainEntity['id'], _tokenAddress: TokenEntity['address']) =>
    state.entities.vaults.byId,
  (ids, byId) => (ids.length > 0 && !!ids[0] ? byId[ids[0]] : undefined)
)(
  (_state: BeefyState, chainId: ChainEntity['id'], tokenAddress: TokenEntity['address']) =>
    `${chainId}-${tokenAddress.toLowerCase()}`
);

export const selectGovVaultVaultIdsByDepositTokenAddress = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  tokenAddress: TokenEntity['address']
) =>
  arrayOrStaticEmpty(
    state.entities.vaults.byChainId[chainId]?.byType.gov.byDepositTokenAddress[
      tokenAddress.toLowerCase()
    ]
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

export const selectVaultWithReceiptByAddressOrUndefined = (
  state: BeefyState,
  chainId: ChainEntity['id'],
  contractAddress: VaultStandard['contractAddress']
) => {
  const vaultId =
    state.entities.vaults.byChainId[chainId]?.byAddress[contractAddress.toLowerCase()];
  return vaultId ? selectVaultByIdWithReceiptOrUndefined(state, vaultId) : undefined;
};

export const selectAllActiveVaultIds = (state: BeefyState) => state.entities.vaults.allActiveIds;

export const selectTotalActiveVaults = (state: BeefyState) => selectAllActiveVaultIds(state).length;

export const selectVaultDepositFee = (state: BeefyState, vaultId: VaultEntity['id']) => {
  const vault = selectVaultById(state, vaultId);
  return vault.depositFee;
};

export const selectVaultLastHarvestByVaultId = createCachedSelector(
  (state: BeefyState, _vaultId: VaultEntity['id']) => state.entities.vaults.lastHarvestById,
  (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId,
  (lastHarvestById, vaultId) => lastHarvestById[vaultId] || 0
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectAllVaultIdsWithBridgedVersion = (state: BeefyState) =>
  state.entities.vaults.allBridgedIds;

export const selectAllVaultsWithBridgedVersion = (state: BeefyState) =>
  selectAllVaultIdsWithBridgedVersion(state).map(id => selectVaultById(state, id));

export const selectAllCowcentratedVaults = createSelector(
  selectAllCowcentratedVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (clmIds, vaultsById): VaultCowcentrated[] =>
    clmIds.map(id => vaultsById[id]!).filter(isCowcentratedVault)
);

export const selectVaultsPinnedConfigs = (state: BeefyState) =>
  state.entities.promos.pinned.configs;

export const selectVaultIsPinned = (state: BeefyState, vaultId: VaultEntity['id']) =>
  state.entities.promos.pinned.byId[vaultId] || false;

export const selectVaultIdForVaultPage = createSelector(
  (_state: BeefyState, vaultId: string | undefined) => vaultId,
  (state: BeefyState, _vaultId: string | undefined) => selectIsConfigAvailable(state),
  (state: BeefyState, vaultId: string | undefined) =>
    vaultId ? selectVaultByIdCaseInsensitiveOrUndefined(state, vaultId) : undefined,
  (vaultId, isLoaded, vault): string => {
    if (!vaultId) {
      return 'not-found';
    }
    if (!isLoaded) {
      return 'loading';
    }
    if (!vault) {
      return 'not-found';
    }
    if (vault.hidden && isCowcentratedVault(vault)) {
      if (featureFlag_disableRedirect()) {
        return vault.id;
      }

      const poolId = getCowcentratedPool(vault);
      if (poolId) {
        return poolId;
      }
    }
    if (vault.hidden) {
      return 'not-found';
    }
    return vault.id;
  }
);
/** Returns false if vault is retired or paused and not earning */
export const selectVaultShouldShowInterest = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultById(state, vaultId),
  (vault: VaultEntity) => shouldVaultShowInterest(vault)
)((_, vaultId: VaultEntity['id']) => vaultId);
