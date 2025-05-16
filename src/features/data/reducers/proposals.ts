import { createSlice } from '@reduxjs/toolkit';
import { keyBy, uniq } from 'lodash-es';
import { fetchActiveProposals, markAllProposalsRead } from '../actions/proposal.ts';
import type { ProposalsState } from './proposals-types.ts';

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
        sliceState.bySpace = proposals.reduce(
          (acc, proposal) => {
            acc[proposal.space] ??= { allIds: [] };
            acc[proposal.space].allIds.push(proposal.id);
            return acc;
          },
          {} as ProposalsState['bySpace']
        );
      })
      .addCase(markAllProposalsRead.fulfilled, (sliceState, action) => {
        const { read } = action.payload;
        sliceState.readIds = uniq([...sliceState.readIds, ...read]);
      });
  },
});
