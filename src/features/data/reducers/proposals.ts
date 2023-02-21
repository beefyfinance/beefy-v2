import { createSlice } from '@reduxjs/toolkit';
import { NormalizedEntity } from '../utils/normalized-entity';
import { ProposalEntity } from '../entities/proposal';
import { fetchActiveProposals, markAllProposalsRead } from '../actions/proposal';
import { keyBy, uniq } from 'lodash';
import { BeefySnapshotProposal } from '../apis/beefy';

export type ProposalsState = NormalizedEntity<ProposalEntity> & {
  readIds: ProposalEntity['id'][];
};

export const initialState: ProposalsState = {
  byId: {},
  allIds: [],
  readIds: [],
};

export const proposalsSlice = createSlice({
  name: 'proposals',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchActiveProposals.fulfilled, (sliceState, action) => {
        const { proposals, read } = action.payload;
        sliceState.byId = keyBy(proposals.map(proposalToEntity), 'id');
        sliceState.allIds = proposals.map(p => p.id);
        sliceState.readIds = uniq([...sliceState.readIds, ...read]);
      })
      .addCase(markAllProposalsRead.fulfilled, (sliceState, action) => {
        const { read } = action.payload;
        sliceState.readIds = uniq([...sliceState.readIds, ...read]);
      });
  },
});

function proposalToEntity(proposal: BeefySnapshotProposal): ProposalEntity {
  return {
    ...proposal,
    url: `https://vote.beefy.finance/#/proposal/${proposal.id}`,
  };
}
