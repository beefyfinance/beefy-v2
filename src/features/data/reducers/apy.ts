import { createSlice, original, type PayloadAction } from '@reduxjs/toolkit';
import { isEqual } from 'lodash-es';
import {
  fetchApyAction,
  fetchAvgApyAction,
  recalculateAvgApyAction,
  recalculateTotalApyAction,
} from '../actions/apy.ts';
import type { ApyContractState, ApyState, TotalApy } from './apy-types.ts';

/** avoid new state ref if entry hasn't changed */
function replaceChangedEntries<T>(
  target: Record<string, T>,
  next: Record<string, T>,
  areEqual: (a: T, b: T) => boolean
) {
  // @dev compare against the pre-draft map: reading entries off the draft creates a proxy for each key
  const base = original(target) ?? target;
  for (const id of Object.keys(base)) {
    if (!Object.hasOwn(next, id)) {
      delete target[id];
    }
  }
  for (const id of Object.keys(next)) {
    const existing = Object.hasOwn(base, id) ? base[id] : undefined;
    if (existing === undefined || !areEqual(existing, next[id])) {
      target[id] = next[id];
    }
  }
}

function totalApyEqual(a: TotalApy, b: TotalApy): boolean {
  const ka = Object.keys(a) as Array<keyof TotalApy>;
  const kb = Object.keys(b) as Array<keyof TotalApy>;
  if (ka.length !== kb.length) return false;
  return ka.every(k => a[k] === b[k]);
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
        replaceChangedEntries(sliceState.avgApy.byVaultId, action.payload.data, isEqual);
      });
  },
});

export const setApyContractState = apySlice.actions.setApyContractState;
