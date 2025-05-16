import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import type { ProposalEntity } from '../entities/proposal.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';
import { createGlobalDataSelector, shouldLoaderLoadOnce } from './data-loader-helpers.ts';

const DELAY_NON_CORE_PROPOSALS = 2 * 60 * 60; // 2 hours

export function selectAllProposalIds(state: BeefyState): ProposalEntity['id'][] {
  return state.entities.proposals.allIds;
}

export const selectAllProposalIdsBySpace = (state: BeefyState, space: string) =>
  arrayOrStaticEmpty(state.entities.proposals.bySpace[space]?.allIds);

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
  (state: BeefyState, space: string) => selectAllProposalIdsBySpace(state, space),
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
  (state: BeefyState, space: string) => selectAllProposalsBySpace(state, space),
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
  (state: BeefyState, space: string) => selectAllActiveProposalsBySpace(state, space),
  (state: BeefyState) => state.entities.proposals.readIds,
  (proposals, readIds): ProposalEntity[] => proposals.filter(p => !readIds.includes(p.id))
);
export const selectShouldInitProposals = createGlobalDataSelector(
  'proposals',
  shouldLoaderLoadOnce
);
