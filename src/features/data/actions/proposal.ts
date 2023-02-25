import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import { BeefySnapshotActiveResponse, BeefySnapshotProposal } from '../apis/beefy';
import { ProposalEntity } from '../entities/proposal';
import { uniq } from 'lodash';
import { selectAllProposalIds } from '../selectors/proposals';

const READ_STORAGE_KEY = 'readProposals';

function getReadProposals(): ProposalEntity['id'][] {
  try {
    const readStorage = window.localStorage.getItem('readProposals');
    if (readStorage && readStorage.startsWith('[') && readStorage.endsWith(']')) {
      const read = JSON.parse(readStorage);
      if (Array.isArray(read) && read.every((id: any) => typeof id === 'string')) {
        return read;
      }
    }
  } catch {}

  return [];
}

function setReadProposals(read: ProposalEntity['id'][], joinExisting: boolean = false) {
  try {
    if (joinExisting) {
      const existing = getReadProposals();
      const joined = uniq([...existing, ...read]);
      window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(joined));
      return joined;
    } else {
      window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(read));
      return read;
    }
  } catch {}

  return read;
}

export type FetchActiveProposalsFulfilledPayload = {
  proposals: BeefySnapshotActiveResponse;
  read: BeefySnapshotProposal['id'][];
};

export const fetchActiveProposals = createAsyncThunk<
  FetchActiveProposalsFulfilledPayload,
  void,
  { state: BeefyState }
>('proposals/fetchActive', async () => {
  const api = getBeefyApi();
  const proposals = await api.getActiveProposals();
  const read = getReadProposals();

  return { proposals, read };
});

export type MarkAllProposalsReadFulfilledPayload = {
  read: ProposalEntity['id'][];
};

export const markAllProposalsRead = createAsyncThunk<
  MarkAllProposalsReadFulfilledPayload,
  void,
  { state: BeefyState }
>('proposals/markAllRead', async (_, { getState }) => {
  const state = getState();
  const proposalIds: ProposalEntity['id'][] = selectAllProposalIds(state);
  const read = setReadProposals(proposalIds, false);
  return { read };
});
