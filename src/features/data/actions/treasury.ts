import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';
import type { TreasuryCompleteBreakdownConfig } from '../apis/config-types';
import { selectActiveChainIds } from '../selectors/chains';
import type { ChainEntity } from '../entities/chain';

export interface FetchTreasuryFulfilledPayload {
  activeChainIds: ChainEntity['id'][];
  data: TreasuryCompleteBreakdownConfig;
  state: BeefyState;
}

export const fetchTreasury = createAsyncThunk<
  FetchTreasuryFulfilledPayload,
  void,
  { state: BeefyState }
>('treasury/fetchTreasury', async (_, { getState }) => {
  const state = getState();
  const api = await getBeefyApi();

  const activeChainIds = selectActiveChainIds(state);
  const data = await api.getTreasury();

  return { activeChainIds, data, state };
});
