import type { PromoEntity } from '../entities/promo.ts';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  type VaultEntity,
} from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';

export const selectPromoById = (state: BeefyState, promoId: PromoEntity['id']) =>
  valueOrThrow(state.entities.promos.byId[promoId], `Unknown promo id ${promoId}`);

export const selectActivePromoForVault = (
  state: BeefyState,
  vaultId: VaultEntity['id']
): PromoEntity | undefined => {
  const promos = state.entities.promos;
  const ids = promos.byVaultId[vaultId]?.allIds;
  if (!ids) {
    return undefined;
  }
  const activeId = ids.find(id => promos.statusById[id] === 'active');
  return activeId ? promos.byId[activeId] : undefined;
};

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
