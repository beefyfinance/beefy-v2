import { ProposalEntity } from '../entities/proposal';
import { BeefyState } from '../../../redux-types';
import { createSelector } from '@reduxjs/toolkit';

const DELAY_NON_CORE_PROPOSALS = 30 * 60; // 30 minutes

export function selectAllProposalIds(state: BeefyState): ProposalEntity['id'][] {
  return state.entities.proposals.allIds;
}

export function selectProposalById(
  state: BeefyState,
  id: ProposalEntity['id']
): ProposalEntity | undefined {
  return state.entities.proposals.byId[id];
}

export const selectAllProposals = createSelector(
  selectAllProposalIds,
  (state: BeefyState) => state.entities.proposals.byId,
  (allIds, byId): ProposalEntity[] => allIds.map(id => byId[id])
);

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

export const selectUnreadActiveProposals = createSelector(
  selectAllActiveProposals,
  (state: BeefyState) => state.entities.proposals.readIds,
  (proposals, readIds): ProposalEntity[] => proposals.filter(p => !readIds.includes(p.id))
);
