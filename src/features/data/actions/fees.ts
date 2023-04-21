import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import type { ApyFeeData } from '../apis/beefy/beefy-api';

export type FetchFeesFulfilledPayload = ApyFeeData;

export const fetchFees = createAsyncThunk<FetchFeesFulfilledPayload, void, { state: BeefyState }>(
  'fees/fetchFees',
  async () => {
    const api = getBeefyApi();
    return await api.getFees();
  }
);
