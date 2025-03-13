import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import { getBeefyApi } from '../apis/instances.ts';
import type { TreasuryCompleteBreakdownConfig } from '../apis/config-types.ts';
import { selectActiveChainIds } from '../selectors/chains.ts';
import type { ChainEntity } from '../entities/chain.ts';

export interface FetchTreasuryFulfilledPayload {
  activeChainIds: ChainEntity['id'][];
  data: TreasuryCompleteBreakdownConfig;
  state: BeefyState;
}

export const fetchTreasury = createAsyncThunk<
  FetchTreasuryFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('treasury/fetchTreasury', async (_, { getState }) => {
  const state = getState();
  const api = await getBeefyApi();

  const activeChainIds = selectActiveChainIds(state);
  const data = await api.getTreasury();

  return { activeChainIds, data, state };
});
