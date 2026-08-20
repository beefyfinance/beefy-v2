import { createSlice, current, type PayloadAction } from '@reduxjs/toolkit';
import { isEqual } from 'lodash-es';
import {
  fetchApyAction,
  fetchAvgApyAction,
  recalculateAvgApyAction,
  recalculateTotalApyAction,
} from '../actions/apy.ts';
import type { ApyContractState, ApyState, AvgApy, TotalApy } from './apy-types.ts';

/**
 * Replacing these maps wholesale gave all ~5.6k entries a fresh identity on every recalc, which
 * invalidated anything memoized per-vault. Only touch entries that actually changed.
 */
function replaceChangedEntries<T>(
  target: Record<string, T>,
  next: Record<string, T>,
  areEqual: (a: T, b: T) => boolean
) {
  for (const id of Object.keys(target)) {
    if (!(id in next)) {
      delete target[id];
    }
  }
  for (const id of Object.keys(next)) {
    const existing = target[id];
    if (existing === undefined || !areEqual(existing, next[id])) {
      target[id] = next[id];
    }
  }
}

// flat primitives, so a key-wise compare works directly on the draft
function totalApyEqual(a: TotalApy, b: TotalApy): boolean {
  const ka = Object.keys(a) as Array<keyof TotalApy>;
  const kb = Object.keys(b) as Array<keyof TotalApy>;
  if (ka.length !== kb.length) return false;
  return ka.every(k => a[k] === b[k]);
}

// nested, so compare the plain value behind the draft
function avgApyEqual(a: AvgApy, b: AvgApy): boolean {
  return isEqual(current(a as never) as AvgApy, b);
}

export const initialApyState: ApyState = {
  rawApy: { byVaultId: {}, byBoostId: {} },
  totalApy: { byVaultId: {} },
  rawAvgApy: { byVaultId: {} },
  avgApy: { byVaultId: {} },
};

export const apySlice = createSlice({
  name: 'apy',
  initialState: initialApyState,
  reducers: {
    setApyContractState: (sliceState, action: PayloadAction<ApyContractState>) => {
      sliceState.rawApy.byBoostId = action.payload.rawApyByBoostId;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchApyAction.fulfilled, (sliceState, action) => {
        for (const [vaultId, apy] of Object.entries(action.payload.data)) {
          sliceState.rawApy.byVaultId[vaultId] = apy;
        }
      })
      .addCase(recalculateTotalApyAction.fulfilled, (sliceState, action) => {
        replaceChangedEntries(sliceState.totalApy.byVaultId, action.payload.totals, totalApyEqual);
      })
      .addCase(fetchAvgApyAction.fulfilled, (sliceState, action) => {
        sliceState.rawAvgApy.byVaultId = action.payload.data;
      })
      .addCase(recalculateAvgApyAction.fulfilled, (sliceState, action) => {
        replaceChangedEntries(sliceState.avgApy.byVaultId, action.payload.data, avgApyEqual);
      });
  },
});

export const setApyContractState = apySlice.actions.setApyContractState;
