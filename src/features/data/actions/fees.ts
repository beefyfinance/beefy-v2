import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import { ApyFeeData } from '../apis/beefy';

export type FetchFeesFulfilledPayload = ApyFeeData;

export const fetchFees = createAsyncThunk<FetchFeesFulfilledPayload, void, { state: BeefyState }>(
  'fees/fetchFees',
  async () => {
    const api = getBeefyApi();
    return await api.getFees();
  }
);
