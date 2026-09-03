import { createCachedSelector } from 're-reselect';
import type { PointStructureBannerConfig } from '../apis/points/types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { BeefyState } from '../store/types.ts';
import { isDefined } from '../utils/array-utils.ts';
import { selectVaultByIdOrUndefined } from './vaults.ts';

export const selectBannersForVault = createCachedSelector(
  (state: BeefyState, vaultId: VaultEntity['id']) =>
    selectVaultByIdOrUndefined(state, vaultId)?.pointStructureIds,
  (state: BeefyState) => state.entities.points.byId,
  (structureIds, byId): PointStructureBannerConfig[] =>
    (structureIds ?? []).map(id => byId[id]?.banner).filter(isDefined)
)((_: BeefyState, vaultId: VaultEntity['id']) => vaultId);
