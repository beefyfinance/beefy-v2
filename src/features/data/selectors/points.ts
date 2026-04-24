import { createCachedSelector } from 're-reselect';
import type { PointStructureEntity } from '../entities/points.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';

export const selectPointStructureById = (
  state: BeefyState,
  id: PointStructureEntity['id']
): PointStructureEntity | undefined => state.entities.points.byId[id];

export const selectBannerStructuresForVault = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultByIdOrUndefined(state, vaultId)?.pointStructureIds,
  (state: BeefyState) => state.entities.points.byId,
  (structureIds, byId): PointStructureEntity[] =>
    (structureIds ?? [])
      .map(id => byId[id])
      .filter((s): s is PointStructureEntity => !!s && !!s.banner)
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);
