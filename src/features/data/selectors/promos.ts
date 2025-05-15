import { createSelector } from '@reduxjs/toolkit';
import { first } from 'lodash-es';
import { createCachedSelector } from 're-reselect';
import type { PromoEntity } from '../entities/promo.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty, valueOrThrow } from '../utils/selector-utils.ts';

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
