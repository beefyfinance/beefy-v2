import type { CuratorEntity } from '../entities/curator.ts';
import type { BeefyState } from '../store/types.ts';
import { valueOrThrow } from '../utils/selector-utils.ts';

export const selectCuratorByIdOrUndefined = (state: BeefyState, curatorId: CuratorEntity['id']) =>
  state.entities.curators.byId[curatorId] || undefined;

export const selectCuratorById = (state: BeefyState, curatorId: CuratorEntity['id']) =>
  valueOrThrow(
    selectCuratorByIdOrUndefined(state, curatorId),
    `selectCuratorById: Unknown curator id ${curatorId}`
  );
