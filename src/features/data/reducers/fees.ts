import { createSlice } from '@reduxjs/toolkit';
import { NormalizedEntity } from '../utils/normalized-entity';
import { ApyPerformanceFeeData, ApyVaultFeeData } from '../apis/beefy';
import { fetchFees } from '../actions/fees';
import { VaultEntity } from '../entities/vault';

export type VaultFee = {
  id: VaultEntity['id'];
  withdraw: ApyVaultFeeData['withdraw'];
} & ApyPerformanceFeeData;

export type FeesState = NormalizedEntity<VaultFee>;

export const initialState: FeesState = {
  byId: {},
  allIds: [],
};

export const feesSlice = createSlice({
  name: 'fees',
  initialState: initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchFees.fulfilled, (sliceState, action) => {
      let added = false;

      for (const [vaultId, data] of Object.entries(action.payload)) {
        if (vaultId in sliceState.byId) {
          // Avoid creating new object/updating state if none of the values have changed
          for (const [key, value] of Object.entries(data.performance)) {
            if (sliceState.byId[vaultId][key] !== value) {
              sliceState.byId[vaultId][key] = value;
            }
          }
          if (sliceState.byId[vaultId].withdraw !== data.withdraw) {
            sliceState.byId[vaultId].withdraw = data.withdraw;
          }
        } else {
          sliceState.byId[vaultId] = {
            id: vaultId,
            ...data.performance,
            withdraw: data.withdraw,
          };
          added = true;
        }
      }

      if (added) {
        sliceState.allIds = Object.keys(sliceState.byId);
      }
    });
  },
});
