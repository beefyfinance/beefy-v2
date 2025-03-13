import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types.ts';
import { getBeefyApi } from '../apis/instances.ts';

import type { ApyFeeData } from '../apis/beefy/beefy-api-types.ts';
import { selectAllCowcentratedVaultIds, selectCowcentratedVaultById } from '../selectors/vaults.ts';

export type FetchFeesFulfilledPayload = ApyFeeData;

export const fetchFees = createAsyncThunk<
  FetchFeesFulfilledPayload,
  void,
  {
    state: BeefyState;
  }
>('fees/fetchFees', async (_, { getState }) => {
  const api = await getBeefyApi();
  const feesByVaultId = await api.getFees();

  // Copy CLM fees to CLM Pools
  const state = getState();
  const allCowcentrated = selectAllCowcentratedVaultIds(state).map(vaultId =>
    selectCowcentratedVaultById(state, vaultId)
  );
  for (const clm of allCowcentrated) {
    if (!clm.cowcentratedIds.pools.length) {
      continue;
    }

    const clmFee = feesByVaultId[clm.id];
    for (const poolId of clm.cowcentratedIds.pools) {
      const clmPoolFee = feesByVaultId[poolId];
      if (!clmPoolFee && clmFee) {
        feesByVaultId[poolId] = clmFee;
      }
    }
  }

  return feesByVaultId;
});
