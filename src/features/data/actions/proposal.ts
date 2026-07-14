import { uniq } from 'lodash-es';
import type {
  BeefySnapshotActiveResponse,
  BeefySnapshotProposal,
} from '../apis/beefy/beefy-api-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import type { ProposalEntity } from '../entities/proposal.ts';
import { selectAllProposalIdsBySpace } from '../selectors/proposals.ts';
import { storageGet, storageSet } from '../../../helpers/storage.ts';
import { createAppAsyncThunk } from '../utils/store-utils.ts';

const READ_STORAGE_KEY = 'readProposals';

function getReadProposals(): ProposalEntity['id'][] {
  try {
    const readStorage = storageGet(READ_STORAGE_KEY);
    if (readStorage && readStorage.startsWith('[') && readStorage.endsWith(']')) {
      const read = JSON.parse(readStorage);
      if (Array.isArray(read) && read.every((id: unknown) => typeof id === 'string')) {
        return read;
      }
    }
  } catch {
    // ignore
  }

  return [];
}

function setReadProposals(read: ProposalEntity['id'][], joinExisting: boolean = false) {
  const toStore = joinExisting ? uniq([...getReadProposals(), ...read]) : read;
  storageSet(READ_STORAGE_KEY, JSON.stringify(toStore));
  return toStore;
}

export type FetchActiveProposalsFulfilledPayload = {
  proposals: BeefySnapshotActiveResponse;
  read: BeefySnapshotProposal['id'][];
};

export const fetchActiveProposals = createAppAsyncThunk<FetchActiveProposalsFulfilledPayload, void>(
  'proposals/fetchActive',
  async () => {
    const api = await getBeefyApi();
    const proposals = await api.getActiveProposals();
    const read = getReadProposals();

    return { proposals, read };
  }
);

export type MarkAllProposalsReadFulfilledPayload = {
  read: ProposalEntity['id'][];
};

export type MarkAllProposalsReadArgs = {
  space: string;
};

export const markAllProposalsRead = createAppAsyncThunk<
  MarkAllProposalsReadFulfilledPayload,
  MarkAllProposalsReadArgs
>('proposals/markAllRead', async ({ space }, { getState }) => {
  const state = getState();
  const proposalIds: ProposalEntity['id'][] = selectAllProposalIdsBySpace(state, space);
  const read = setReadProposals(proposalIds, false);
  return { read };
});
