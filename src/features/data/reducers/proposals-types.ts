import type { ProposalEntity } from '../entities/proposal.ts';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';

export type ProposalsState = NormalizedEntity<ProposalEntity> & {
  readIds: ProposalEntity['id'][];
  bySpace: {
    [space: string]: {
      allIds: string[];
    };
  };
};
