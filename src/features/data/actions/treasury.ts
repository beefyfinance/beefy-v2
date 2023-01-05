import { createAsyncThunk } from '@reduxjs/toolkit';
import { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import { TreasuryConfig } from '../apis/config-types';
import { selectAllChainIds } from '../selectors/chains';

export interface FetchTreasuryFulfilledPayload {
  allChainIds: string[];
  data: TreasuryConfig;
}

export const fetchTreasury = createAsyncThunk<
  FetchTreasuryFulfilledPayload,
  void,
  { state: BeefyState }
>('treasury/fetchTreasury', async (_, { getState }) => {
  const api = getBeefyApi();
  const allChainIds = selectAllChainIds(getState());
  const data = await api.getTreasury();
  return { allChainIds, data };
});
