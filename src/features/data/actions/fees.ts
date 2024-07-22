import { createAsyncThunk } from '@reduxjs/toolkit';
import type { BeefyState } from '../../../redux-types';
import { getBeefyApi } from '../apis/instances';

import type { ApyFeeData } from '../apis/beefy/beefy-api-types';
import { selectAllCowcentratedVaultIds, selectCowcentratedVaultById } from '../selectors/vaults';

export type FetchFeesFulfilledPayload = ApyFeeData;

export const fetchFees = createAsyncThunk<FetchFeesFulfilledPayload, void, { state: BeefyState }>(
  'fees/fetchFees',
  async (_, { getState }) => {
    const api = await getBeefyApi();
    const feesByVaultId = await api.getFees();

    // Copy CLM fees to CLM Pools
    const state = getState();
    const allCowcentrated = selectAllCowcentratedVaultIds(state).map(vaultId =>
      selectCowcentratedVaultById(state, vaultId)
    );
    for (const clm of allCowcentrated) {
      if (!clm.cowcentratedGovId) {
        continue;
      }

      const clmFee = feesByVaultId[clm.id];
      const clmPoolFee = feesByVaultId[clm.cowcentratedGovId];
      if (!clmPoolFee && clmFee) {
        feesByVaultId[clm.cowcentratedGovId] = clmFee;
      }
    }

    return feesByVaultId;
  }
);
