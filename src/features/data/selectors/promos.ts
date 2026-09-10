import type { PromoEntity } from '../entities/promo.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';

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
