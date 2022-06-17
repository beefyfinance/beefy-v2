import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfigApi } from '../apis/instances';
import { StrategyTypeConfig } from '../apis/config-types';

export type FetchStrategyTypesPayload = StrategyTypeConfig[];

// Note: Not called yet
export const fetchStrategyTypes = createAsyncThunk<FetchStrategyTypesPayload>(
  'strategy-types/fetchStrategyTypes',
  async () => {
    const api = getConfigApi();
    return await api.fetchStrategyTypes();
  }
);
