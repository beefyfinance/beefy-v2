import { type AsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  tenderlyLogin,
  type TenderlyOpenSimulationPayload,
  tenderlySimulate,
  tenderlySimulateMerklClaim,
  tenderlySimulateStellaSwapClaim,
  tenderlySimulateTransactQuote,
} from '../actions/tenderly.ts';
import { transactConfirmRejected } from '../actions/transact.ts';
import type { TenderlyState } from './tenderly-types.ts';

const initialState: TenderlyState = {
  mode: 'closed',
  status: 'idle',
};

export const tenderlySlice = createSlice({
  name: 'tenderly',
  initialState,
  reducers: {
    tenderlyClose: state => {
      state.mode = 'closed';
      state.status = 'idle';
      state.error = undefined;
    },
    tenderlyOpenLogin: state => {
      state.mode = 'login';
      state.status = 'idle';
      state.error = undefined;
    },
  },
  extraReducers: builder => {
    const handleCalls = <T>(
      thunk: AsyncThunk<
        TenderlyOpenSimulationPayload,
        T,
        {
          state: unknown;
        }
      >
    ) => {
      builder
        .addCase(thunk.pending, state => {
          state.mode = 'calls';
          state.status = 'pending';
          state.error = undefined;
        })
        .addCase(thunk.rejected, (state, action) => {
          if (state.mode !== 'calls' || state.status !== 'pending') {
            return;
          }
          state.status = 'rejected';
          state.error = action.error;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          if (state.mode !== 'calls' || state.status !== 'pending') {
            return;
          }

          state.request = {
            chainId: action.payload.chainId,
            calls: action.payload.calls,
          };

          state.status = 'idle';
          if (
            state.credentials &&
            state.credentials.account &&
            state.credentials.project &&
            state.credentials.secret
          ) {
            state.mode = 'request';
          } else {
            state.mode = 'login';
          }
        });
    };

    handleCalls(tenderlySimulateTransactQuote);
    handleCalls(tenderlySimulateMerklClaim);
    handleCalls(tenderlySimulateStellaSwapClaim);

    builder
      .addCase(transactConfirmRejected, state => {
        if (state.mode !== 'calls' || state.status !== 'pending') {
          return;
        }
        state.mode = 'closed';
        state.status = 'idle';
      })
      .addCase(tenderlyLogin.pending, (state, action) => {
        state.mode = 'login';
        state.status = 'pending';
        state.error = undefined;
        state.credentials = {
          account: action.meta.arg.credentials.account,
          project: action.meta.arg.credentials.project,
          secret: '',
        };
      })
      .addCase(tenderlyLogin.rejected, (state, action) => {
        if (state.mode !== 'login' || state.status !== 'pending') {
          return;
        }
        state.status = 'rejected';
        state.error = action.error;
      })
      .addCase(tenderlyLogin.fulfilled, (state, action) => {
        if (state.mode !== 'login' || state.status !== 'pending') {
          return;
        }
        state.credentials = action.payload.credentials;
        state.status = 'idle';
        state.mode = 'request';
      })
      .addCase(tenderlySimulate.pending, state => {
        state.mode = 'simulate';
        state.status = 'pending';
        state.error = undefined;
        state.result = undefined;
      })
      .addCase(tenderlySimulate.rejected, (state, action) => {
        if (state.mode !== 'simulate' || state.status !== 'pending') {
          return;
        }
        state.status = 'rejected';
        state.error = action.error;
      })
      .addCase(tenderlySimulate.fulfilled, (state, action) => {
        if (state.mode !== 'simulate' || state.status !== 'pending') {
          return;
        }
        state.result = action.payload;
        state.status = 'idle';
        state.mode = 'result';
      });
  },
});

export const tenderlyReducer = tenderlySlice.reducer;
export const { tenderlyClose, tenderlyOpenLogin } = tenderlySlice.actions;
