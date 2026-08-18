import type BigNumber from 'bignumber.js';
import { createCachedSelector } from 're-reselect';
import { createSelector } from 'reselect';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { pushOrSet } from '../../../helpers/object.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { TokenEntity } from '../entities/token.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { normalizeSimplifiedAsset } from '../utils/simplified-assets.ts';
import { EMPTY_ARRAY } from '../utils/selector-utils.ts';
import { selectFilterAssetType, selectFilterVaultCategory } from './filtered-vaults.ts';
import { isTokenBluechip, isTokenMeme, isTokenStable, isTokenStock } from './tokens.ts';
import { selectAllActiveVaultIds } from './vaults.ts';

type ChainVaultIds = Partial<Record<ChainEntity['id'], VaultEntity['id'][]>>;

export type SimplifiedAssetIndex = {
  /** canonical asset key -> chain id -> vault ids */
  byAsset: Record<string, ChainVaultIds>;
  assetKeys: string[];
};

/** Synthetic bucket: every vault whose principal asset is a stablecoin collects here */
export const STABLES_ASSET_KEY = 'Stables';

type TokensByChainId = BeefyState['entities']['tokens']['byChainId'];

function resolveAssetToken(
  byChainId: TokensByChainId,
  chainId: VaultEntity['chainId'],
  tokenId: string
): TokenEntity | undefined {
  const address = byChainId[chainId]?.byId[tokenId];
  return address ? byChainId[chainId]?.byAddress[address] : undefined;
}

function hasTag(
  byChainId: TokensByChainId,
  vault: VaultEntity,
  tokenId: string,
  isTag: (token: TokenEntity) => boolean
): boolean {
  const token = resolveAssetToken(byChainId, vault.chainId, tokenId);
  return !!token && isTag(token);
}

/** Mirrors the vaultCategory rules in utils/vault-filter.ts, which AND the selected categories */
function vaultPassesCategories(
  byChainId: TokensByChainId,
  vault: VaultEntity,
  categories: ReturnType<typeof selectFilterVaultCategory>
): boolean {
  if (!categories.length) {
    return true;
  }
  const allStable = vault.assetIds.every(id => hasTag(byChainId, vault, id, isTokenStable));

  if (categories.includes('stable') && !allStable) {
    return false;
  }
  if (categories.includes('correlated') && (vault.assetIds.length < 2 || allStable)) {
    return false;
  }
  if (
    categories.includes('bluechip') &&
    !vault.assetIds.every(
      id =>
        hasTag(byChainId, vault, id, isTokenBluechip) ||
        !hasTag(byChainId, vault, id, isTokenStable)
    )
  ) {
    return false;
  }
  if (
    categories.includes('meme') &&
    !vault.assetIds.some(id => hasTag(byChainId, vault, id, isTokenMeme))
  ) {
    return false;
  }
  if (
    categories.includes('stock') &&
    !vault.assetIds.some(id => hasTag(byChainId, vault, id, isTokenStock))
  ) {
    return false;
  }
  return true;
}

/**
 * principal asset -> chain -> vaults, over active vaults passing the two visible filters.
 *
 * A vault is listed ONCE, under its principal asset: `assetIds[0]`, which is always the first
 * token of the vault name (verified across every multi-asset config). So GME-USDC lists under GME
 * and not under the USDC it is quoted against. Vaults whose principal is a stablecoin collect in
 * one synthetic `Stables` bucket instead of a row per stablecoin.
 *
 * Memoized on the vault/token slices and the two filter values, never on tvl: `tvl.byVaultId` gets
 * a fresh identity once per chain per poll (~41x), and this is the one full scan in the view.
 */
export const selectSimplifiedAssetIndex = createSelector(
  selectAllActiveVaultIds,
  (state: BeefyState) => state.entities.vaults.byId,
  (state: BeefyState) => state.entities.tokens.byChainId,
  selectFilterVaultCategory,
  selectFilterAssetType,
  (activeIds, vaultsById, tokensByChainId, categories, assetTypes): SimplifiedAssetIndex => {
    const byAsset: Record<string, ChainVaultIds> = {};

    for (const id of activeIds) {
      const vault = vaultsById[id];
      if (!vault) {
        continue;
      }
      if (assetTypes.length && !assetTypes.includes(vault.assetType)) {
        continue;
      }
      if (!vaultPassesCategories(tokensByChainId, vault, categories)) {
        continue;
      }
      const principal = vault.assetIds[0];
      if (!principal) {
        continue;
      }
      // group on the token's display symbol, not the addressbook id: `MSTRrh` is shown as MSTR and
      // has no icon under its id, and per-chain ids (`opUSDCe`) only alias cleanly once resolved
      const token = resolveAssetToken(tokensByChainId, vault.chainId, principal);
      const key =
        token && isTokenStable(token) ? STABLES_ASSET_KEY : (
          normalizeSimplifiedAsset(token?.symbol || principal)
        );
      pushOrSet((byAsset[key] ??= {}) as Record<string, VaultEntity['id'][]>, vault.chainId, id);
    }

    return { byAsset, assetKeys: Object.keys(byAsset) };
  }
);

type AssetTotals = {
  tvl: BigNumber;
  order: number;
  byChain: Record<string, { tvl: BigNumber; order: number }>;
};

/**
 * Every aggregate the view needs, in ONE pass over the index.
 *
 * `state.biz.tvl.byVaultId` gets a fresh identity once per chain per poll (~41x a cycle), so
 * anything memoized on it reruns that often. With LP legs counted an asset can span 400+ vaults;
 * summing per-asset-selector meant ~13 passes over that per tick. This is the single pass they all
 * read from.
 */
const selectSimplifiedTotals = createSelector(
  selectSimplifiedAssetIndex,
  (state: BeefyState) => state.biz.tvl.byVaultId,
  (index, byVaultId): Record<string, AssetTotals> => {
    const totals: Record<string, AssetTotals> = {};

    for (const assetKey of index.assetKeys) {
      const chains = index.byAsset[assetKey];
      if (!chains) {
        continue;
      }
      const byChain: AssetTotals['byChain'] = {};
      let assetTotal = BIG_ZERO;

      for (const [chainId, ids] of Object.entries(chains)) {
        let chainTotal = BIG_ZERO;
        for (const id of ids || EMPTY_ARRAY) {
          const tvl = byVaultId[id]?.tvl;
          if (tvl) {
            chainTotal = chainTotal.plus(tvl);
          }
        }
        byChain[chainId] = { tvl: chainTotal, order: chainTotal.toNumber() };
        assetTotal = assetTotal.plus(chainTotal);
      }

      totals[assetKey] = { tvl: assetTotal, order: assetTotal.toNumber(), byChain };
    }

    return totals;
  }
);

/**
 * How many assets the simplified list shows when no search is active. Counting LP legs there are
 * ~341 assets with an active vault, most with a single vault — a shortlist is the whole point of
 * the view. Search still spans every asset.
 */
export const SIMPLIFIED_ASSET_LIMIT = 12;

/** Derived set: every asset with an active vault, richest first */
export const selectSimplifiedAssetKeysByTvl = createSelector(
  selectSimplifiedAssetIndex,
  selectSimplifiedTotals,
  (index, totals) => {
    if (!index.assetKeys.length) {
      return EMPTY_ARRAY as unknown as string[];
    }
    // assetKeys derives from allActiveIds, which is pre-sorted, so ties stay stable
    return index.assetKeys
      .slice()
      .sort((a, b) => (totals[b]?.order ?? 0) - (totals[a]?.order ?? 0));
  }
);

/** Chains holding a vault for this asset, richest first */
export const selectSimplifiedChainIdsByTvl = createCachedSelector(
  selectSimplifiedAssetIndex,
  selectSimplifiedTotals,
  (_state: BeefyState, assetKey: string) => assetKey,
  (index, totals, assetKey) => {
    const chains = index.byAsset[assetKey];
    if (!chains) {
      return EMPTY_ARRAY as unknown as ChainEntity['id'][];
    }
    const byChain = totals[assetKey]?.byChain;
    return (Object.keys(chains) as ChainEntity['id'][]).sort(
      (a, b) => (byChain?.[b]?.order ?? 0) - (byChain?.[a]?.order ?? 0)
    );
  }
)((_state: BeefyState, assetKey: string) => assetKey);

/** Vaults for one asset on one chain, richest first */
export const selectSimplifiedVaultIdsByTvl = createCachedSelector(
  selectSimplifiedAssetIndex,
  (state: BeefyState) => state.biz.tvl.byVaultId,
  (_state: BeefyState, assetKey: string) => assetKey,
  (_state: BeefyState, _assetKey: string, chainId: ChainEntity['id']) => chainId,
  (index, byVaultId, assetKey, chainId) => {
    const ids = index.byAsset[assetKey]?.[chainId];
    if (!ids || !ids.length) {
      return EMPTY_ARRAY as unknown as VaultEntity['id'][];
    }
    return ids
      .slice()
      .sort(
        (a, b) => (byVaultId[b]?.tvl || BIG_ZERO).comparedTo(byVaultId[a]?.tvl || BIG_ZERO) ?? 0
      );
  }
)((_state: BeefyState, assetKey: string, chainId: ChainEntity['id']) => `${assetKey}:${chainId}`);

/** Aggregate TVL across every vault holding this asset */
export const selectSimplifiedAssetTvl = createCachedSelector(
  selectSimplifiedTotals,
  (_state: BeefyState, assetKey: string) => assetKey,
  (totals, assetKey) => totals[assetKey]?.tvl || BIG_ZERO
)((_state: BeefyState, assetKey: string) => assetKey);

/** Aggregate TVL for this asset on one chain */
export const selectSimplifiedChainTvl = createCachedSelector(
  selectSimplifiedTotals,
  (_state: BeefyState, assetKey: string) => assetKey,
  (_state: BeefyState, _assetKey: string, chainId: ChainEntity['id']) => chainId,
  (totals, assetKey, chainId) => totals[assetKey]?.byChain[chainId]?.tvl || BIG_ZERO
)((_state: BeefyState, assetKey: string, chainId: ChainEntity['id']) => `${assetKey}:${chainId}`);

/** Total number of vaults holding this asset, across all chains */
export const selectSimplifiedAssetVaultCount = createCachedSelector(
  selectSimplifiedAssetIndex,
  (_state: BeefyState, assetKey: string) => assetKey,
  (index, assetKey) =>
    Object.values(index.byAsset[assetKey] || {}).reduce((acc, ids) => acc + (ids?.length || 0), 0)
)((_state: BeefyState, assetKey: string) => assetKey);
