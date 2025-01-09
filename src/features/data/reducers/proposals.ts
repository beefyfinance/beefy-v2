import { createSlice } from '@reduxjs/toolkit';
import type { NormalizedEntity } from '../utils/normalized-entity';
import type { ProposalEntity } from '../entities/proposal';
import { fetchActiveProposals, markAllProposalsRead } from '../actions/proposal';
import { keyBy, uniq } from 'lodash-es';

export type ProposalsState = NormalizedEntity<ProposalEntity> & {
  readIds: ProposalEntity['id'][];
  bySpace: {
    [space: string]: {
      allIds: string[];
    };
  };
};

export const initialState: ProposalsState = {
  byId: {},
  allIds: [],
  readIds: [],
  bySpace: {},
};

export const proposalsSlice = createSlice({
  name: 'proposals',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchActiveProposals.fulfilled, (sliceState, action) => {
        const { proposals, read } = action.payload;
        sliceState.byId = keyBy(proposals, 'id');
        sliceState.allIds = proposals.map(p => p.id);
        sliceState.readIds = uniq([...sliceState.readIds, ...read]);
        sliceState.bySpace = proposals.reduce((acc, proposal) => {
          acc[proposal.space] ??= { allIds: [] };
          acc[proposal.space].allIds.push(proposal.id);
          return acc;
        }, {});
      })
      .addCase(markAllProposalsRead.fulfilled, (sliceState, action) => {
        const { read } = action.payload;
        sliceState.readIds = uniq([...sliceState.readIds, ...read]);
      });
  },
});
