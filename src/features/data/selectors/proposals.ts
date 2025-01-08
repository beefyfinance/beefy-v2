import type { ProposalEntity } from '../entities/proposal';
import type { BeefyState } from '../../../redux-types';
import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';

const DELAY_NON_CORE_PROPOSALS = 2 * 60 * 60; // 2 hours

export function selectAllProposalIds(state: BeefyState): ProposalEntity['id'][] {
  return state.entities.proposals.allIds;
}

export const selectAllProposalIdsBySpace = createSelector(
  (state: BeefyState, space: string) => state.entities.proposals.bySpace[space],
  (space): ProposalEntity['id'][] => space?.allIds || []
);

export function selectProposalById(
  state: BeefyState,
  id: ProposalEntity['id']
): ProposalEntity | undefined {
  return state.entities.proposals.byId[id];
}

export const selectAllProposals = createSelector(
  selectAllProposalIds,
  (state: BeefyState) => state.entities.proposals.byId,
  (allIds, byId): ProposalEntity[] => allIds.map(id => byId[id]!)
);

export const selectAllProposalsBySpace = createCachedSelector(
  selectAllProposalIdsBySpace,
  (state: BeefyState) => state.entities.proposals.byId,
  (allIds, byId): ProposalEntity[] => allIds.map(id => byId[id]!)
)((_, space) => space);

export const selectAllActiveProposals = createSelector(
  selectAllProposals,
  () => Math.floor(Date.now() / 1000),
  (proposals, now): ProposalEntity[] =>
    proposals.filter(
      p =>
        p.start <= now &&
        p.end >= now &&
        (p.coreProposal || p.start + DELAY_NON_CORE_PROPOSALS <= now)
    )
);

export const selectAllActiveProposalsBySpace = createSelector(
  selectAllProposalsBySpace,
  () => Math.floor(Date.now() / 1000),
  (proposals, now): ProposalEntity[] =>
    proposals.filter(
      p =>
        p.start <= now &&
        p.end >= now &&
        (p.coreProposal || p.start + DELAY_NON_CORE_PROPOSALS <= now)
    )
);

export const selectUnreadActiveProposals = createSelector(
  selectAllActiveProposals,
  (state: BeefyState) => state.entities.proposals.readIds,
  (proposals, readIds): ProposalEntity[] => proposals.filter(p => !readIds.includes(p.id))
);

export const selectUnreadActiveProposalsBySpace = createSelector(
  selectAllActiveProposalsBySpace,
  (state: BeefyState) => state.entities.proposals.readIds,
  (proposals, readIds): ProposalEntity[] => proposals.filter(p => !readIds.includes(p.id))
);
