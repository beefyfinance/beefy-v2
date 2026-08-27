import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import restrictionsConfig from '../../../config/restrictions.json';
import type { RestrictionProfileConfig, RestrictionsConfig } from '../apis/config-types.ts';
import { isCowcentratedLikeVault, type VaultEntity } from '../entities/vault.ts';
import type { LoaderState } from '../reducers/data-loader-types.ts';
import type { BeefyState } from '../store/types.ts';
import {
  hasLoaderFulfilledOnce,
  hasLoaderSettledOnce,
  isLoaderRejected,
} from './data-loader-helpers.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';

const restrictions: RestrictionsConfig = restrictionsConfig;

const UNKNOWN_COUNTRIES = ['XX', 'T1'];
const EMPTY_SET: ReadonlySet<string> = new Set();
const EMPTY_ARRAY: string[] = [];

export type UserGeoStatus = 'loading' | 'blocked' | 'allowed';

/** key format: `${chainId}:${lowercase address}` */
export const tokenKeyOf = (chainId: string, address: string) =>
  `${chainId}:${address.toLowerCase()}`;

const profileByTokenKey = new Map<string, string>();
const profileByAssetKey = new Map<string, string>();
const tokenKeysByProfile: Record<string, Set<string>> = {};
for (const [profileId, profile] of Object.entries(restrictions)) {
  const keys = new Set<string>();
  for (const [chainId, addresses] of Object.entries(profile.tokens)) {
    for (const address of addresses) {
      const key = tokenKeyOf(chainId, address);
      keys.add(key);
      profileByTokenKey.set(key, profileId);
    }
  }
  tokenKeysByProfile[profileId] = keys;
  for (const [chainId, assetIds] of Object.entries(profile.assets ?? {})) {
    for (const assetId of assetIds) {
      profileByAssetKey.set(`${chainId}:${assetId}`, profileId);
    }
  }
}

export type VaultGeoRestriction = {
  profileId: string;
  tokenAddress?: string;
  assetId?: string;
};

function getVaultGeoRestriction(vault: VaultEntity): VaultGeoRestriction | undefined {
  const profileId = profileByTokenKey.get(tokenKeyOf(vault.chainId, vault.depositTokenAddress));
  if (profileId) {
    return { profileId, tokenAddress: vault.depositTokenAddress };
  }
  if (isCowcentratedLikeVault(vault)) {
    for (const address of vault.depositTokenAddresses) {
      const underlyingProfileId = profileByTokenKey.get(tokenKeyOf(vault.chainId, address));
      if (underlyingProfileId) {
        return { profileId: underlyingProfileId, tokenAddress: address };
      }
    }
  }
  // fallback for vaults without address-level underlyings (e.g. standard vaults over an LP)
  for (const assetId of vault.assetIds) {
    const assetProfileId = profileByAssetKey.get(`${vault.chainId}:${assetId}`);
    if (assetProfileId) {
      return { profileId: assetProfileId, assetId };
    }
  }
  return undefined;
}

function getGeoStatusForProfile(
  profile: RestrictionProfileConfig,
  loader: LoaderState | undefined,
  countryCode: string | undefined
): UserGeoStatus {
  if (isLoaderRejected(loader)) {
    return 'blocked'; // fail closed on error
  }
  if (!hasLoaderFulfilledOnce(loader)) {
    // a pending retry after a failure stays blocked; only the first attempt shows loading
    return hasLoaderSettledOnce(loader) ? 'blocked' : 'loading';
  }
  const country = countryCode?.toUpperCase();
  if (!country || UNKNOWN_COUNTRIES.includes(country)) {
    return 'blocked'; // fail closed on unknown location
  }
  return profile.countries.includes(country) ? 'blocked' : 'allowed';
}

/** detected country code, or undefined when not yet known / an unknown-location sentinel */
export const selectUserCountryCode = (state: BeefyState): string | undefined => {
  const country = state.user.restrictions.countryCode?.toUpperCase();
  return !country || UNKNOWN_COUNTRIES.includes(country) ? undefined : country;
};

export const selectUserGeoStatusForProfile = (
  state: BeefyState,
  profileId: string
): UserGeoStatus =>
  getGeoStatusForProfile(
    restrictions[profileId],
    state.ui.dataLoader.global.geoCountry,
    state.user.restrictions.countryCode
  );

/** restriction profile covering any of the vault's deposit token(s) plus the matched token/asset, if any */
export const selectVaultGeoRestriction = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) => selectVaultByIdOrUndefined(state, vaultId),
  vault => (vault ? getVaultGeoRestriction(vault) : undefined)
)((_state: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectVaultGeoStatus = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): UserGeoStatus => {
  const restriction = selectVaultGeoRestriction(state, vaultId);
  return restriction === undefined ? 'allowed' : (
      selectUserGeoStatusForProfile(state, restriction.profileId)
    );
};

/** fail-closed boolean for consumers without a loading state (loading counts as blocked) */
export const selectIsVaultGeoBlockedForUser = (state: BeefyState, vaultId: VaultEntity['id']) =>
  selectVaultGeoStatus(state, vaultId) !== 'allowed';

const selectGeoBlockedProfileIds = createSelector(
  (state: BeefyState) => state.ui.dataLoader.global.geoCountry,
  (state: BeefyState) => state.user.restrictions.countryCode,
  (loader, countryCode): string[] => {
    const blocked = Object.keys(restrictions).filter(
      profileId =>
        getGeoStatusForProfile(restrictions[profileId], loader, countryCode) !== 'allowed'
    );
    return blocked.length === 0 ? EMPTY_ARRAY : blocked;
  }
);

/** receipt/contract token keys of every vault whose deposit token(s) are restricted, per profile */
const selectGeoRestrictedVaultReceiptKeysByProfile = createSelector(
  (state: BeefyState) => state.entities.vaults.byId,
  byId => {
    const byProfile: Record<string, Set<string>> = {};
    for (const vault of Object.values(byId)) {
      if (!vault) {
        continue;
      }
      const restriction = getVaultGeoRestriction(vault);
      if (!restriction) {
        continue;
      }
      const keys = (byProfile[restriction.profileId] ??= new Set());
      keys.add(tokenKeyOf(vault.chainId, vault.contractAddress));
      if ('receiptTokenAddress' in vault) {
        keys.add(tokenKeyOf(vault.chainId, vault.receiptTokenAddress));
      }
    }
    return byProfile;
  }
);

/**
 * Token keys the user may not swap in or out: restricted tokens plus receipt tokens of
 * restricted vaults (blocks v2v/cross-chain share-token routes too). Empty set when allowed.
 */
export const selectGeoBlockedTokenAndReceiptKeys = createSelector(
  selectGeoBlockedProfileIds,
  selectGeoRestrictedVaultReceiptKeysByProfile,
  (profileIds, receiptKeysByProfile): ReadonlySet<string> => {
    if (profileIds.length === 0) {
      return EMPTY_SET;
    }
    const blocked = new Set<string>();
    for (const profileId of profileIds) {
      for (const key of tokenKeysByProfile[profileId] || []) {
        blocked.add(key);
      }
      for (const key of receiptKeysByProfile[profileId] || []) {
        blocked.add(key);
      }
    }
    return blocked;
  }
);
