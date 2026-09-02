import { createSelector } from '@reduxjs/toolkit';
import { first } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import type { PromoEntity } from '../entities/promo.ts';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty, valueOrThrow } from '../utils/selector-utils.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';

export const selectPromoById = (state: BeefyState, promoId: PromoEntity['id']) =>
  valueOrThrow(state.entities.promos.byId[promoId], `Unknown promo id ${promoId}`);

export const selectActivePromoIdsForVault = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    state.entities.promos.byVaultId[vaultId]?.allIds,
  (state: BeefyState) => state.entities.promos.statusById,
  (promoIds, statusById) =>
    arrayOrStaticEmpty((promoIds || []).filter(id => statusById[id] === 'active'))
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectActivePromosForVault = createCachedSelector(
  selectActivePromoIdsForVault,
  (state: BeefyState) => state.entities.promos.byId,
  (promoIds, promosById) => promoIds.map(id => promosById[id])
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);

export const selectActivePromoForVault = createSelector(selectActivePromosForVault, promos =>
  first(promos)
);

/** First active promo on the vault, or on any group member for a base CLM row */
export const selectActivePromoForVaultGroup = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): PromoEntity | undefined => {
  const vault = selectVaultByIdOrUndefined(state, vaultId);
  const memberIds =
    vault && isCowcentratedVault(vault) ?
      [vault.id, ...getCowcentratedWrapperIds(vault)]
    : [vaultId];

  for (const memberId of memberIds) {
    const promo = selectActivePromoForVault(state, memberId);
    if (promo) {
      return promo;
    }
  }
  return undefined;
};
