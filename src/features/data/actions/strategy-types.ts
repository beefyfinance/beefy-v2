import { createAsyncThunk } from '@reduxjs/toolkit';
import { getStrategyTypesApi } from '../apis/instances';
import { StrategyTypeConfig } from '../apis/strategy-type/strategy-type-types';

export type FetchStrategyTypesPayload = StrategyTypeConfig[];

// Note: Not called yet
export const fetchStrategyTypes = createAsyncThunk<FetchStrategyTypesPayload>(
  'strategy-types/fetchStrategyTypes',
  async () => {
    const api = getStrategyTypesApi();
    return await api.fetchStrategyTypes();
  }
);
