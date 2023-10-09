import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getSnapshotBalanceApi } from '../apis/instances';
import type { SnapshotBalanceResponse } from '../apis/snapshot-balance/snapshot-balance-types';

interface FetchUserSnapshotBalanceFulfilled {
  address: string;
  balance: SnapshotBalanceResponse;
}

export const fetchUserSnapshotBalance = createAsyncThunk<
  FetchUserSnapshotBalanceFulfilled,
  { address: string },
  { state: BeefyState }
>('balance/snapshot-balance', async ({ address }) => {
  const snapshotBalanceApi = await getSnapshotBalanceApi();
  const data = await snapshotBalanceApi.getUserSnapshotBalance(address);

  return { address, balance: data };
});
