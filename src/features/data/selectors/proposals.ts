import type { ProposalEntity } from '../entities/proposal.ts';
import type { BeefyState } from '../store/types.ts';
import { arrayOrStaticEmpty } from '../utils/selector-utils.ts';

const DELAY_NON_CORE_PROPOSALS = 2 * 60 * 60; // 2 hours

export function selectAllProposalIds(state: BeefyState): ProposalEntity['id'][] {
  return state.entities.proposals.allIds;
}

export const selectAllProposalIdsBySpace = (state: BeefyState, space: string) =>
  arrayOrStaticEmpty(state.entities.proposals.bySpace[space]?.allIds);

function isProposalActive(p: ProposalEntity, now: number): boolean {
  return (
    p.start <= now && p.end >= now && (p.coreProposal || p.start + DELAY_NON_CORE_PROPOSALS <= now)
  );
}

function selectUnreadActiveProposalCount(state: BeefyState, ids: ProposalEntity['id'][]): number {
  const { byId, readIds } = state.entities.proposals;
  const now = Math.floor(Date.now() / 1000);
  let count = 0;
  for (const id of ids) {
    const p = byId[id];
    if (p && isProposalActive(p, now) && !readIds.includes(p.id)) {
      count++;
    }
  }
  return count;
}

export function selectUnreadActiveProposalsCount(state: BeefyState): number {
  return selectUnreadActiveProposalCount(state, selectAllProposalIds(state));
}

export function selectUnreadActiveProposalsCountBySpace(state: BeefyState, space: string): number {
  return selectUnreadActiveProposalCount(state, selectAllProposalIdsBySpace(state, space));
}
