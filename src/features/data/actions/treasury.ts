import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import type { TreasuryConfig } from '../apis/config-types';
import { selectAllChainIds, selectEolChainIds } from '../selectors/chains';
import type { ChainEntity } from '../entities/chain';

export interface FetchTreasuryFulfilledPayload {
  allChainIds: ChainEntity['id'][];
  eolChainIds: ChainEntity['id'][];
  data: TreasuryConfig;
  state: BeefyState;
}

export const fetchTreasury = createAsyncThunk<
  FetchTreasuryFulfilledPayload,
  void,
  { state: BeefyState }
>('treasury/fetchTreasury', async (_, { getState }) => {
  const state = getState();
  const api = getBeefyApi();
  const allChainIds = selectAllChainIds(state);
  const eolChainIds = selectEolChainIds(state);
  const data = await api.getTreasury();

  return { allChainIds, eolChainIds, data, state };
});
