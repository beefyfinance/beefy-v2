import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import { TreasuryConfig } from '../apis/config-types';

export type FetchTreasuryFulfilledPayload = TreasuryConfig;

export const fetchTreasury = createAsyncThunk<
  FetchTreasuryFulfilledPayload,
  void,
  { state: BeefyState }
>('treasury/fetchTreasury', async () => {
  const api = getBeefyApi();
  return await api.getTreasury();
});
