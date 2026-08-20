import type { ProposalEntity } from '../entities/proposal';
import type { NormalizedEntity } from '../utils/normalized-entity';
export type ProposalsState = NormalizedEntity<ProposalEntity> & {
    readIds: ProposalEntity['id'][];
    bySpace: {
        [space: string]: {
            allIds: string[];
        };
    };
};
