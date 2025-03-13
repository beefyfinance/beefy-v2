import { createSlice } from '@reduxjs/toolkit';
import type { NormalizedEntity } from '../utils/normalized-entity.ts';
import { fetchFees } from '../actions/fees.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { ApyPerformanceFeeData, ApyVaultFeeData } from '../apis/beefy/beefy-api-types.ts';
import { entries } from '../../../helpers/object.ts';

export type VaultFee = {
  id: VaultEntity['id'];
  withdraw: ApyVaultFeeData['withdraw'];
  deposit: ApyVaultFeeData['deposit'] | undefined;
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
      for (const [vaultId, data] of Object.entries(action.payload)) {
        const fees = getOrCreateVaultFees(sliceState, vaultId, data);

        // Avoid creating new object/updating state if none of the values have changed
        for (const [key, value] of entries(data.performance)) {
          if (fees[key] !== value) {
            fees[key] = value;
          }
        }

        for (const key of ['withdraw', 'deposit'] as const) {
          if (data[key] && fees[key] !== data[key]) {
            fees[key] = data[key];
          }
        }
      }
    });
  },
});

function getOrCreateVaultFees(
  sliceState: FeesState,
  vaultId: VaultEntity['id'],
  data: ApyVaultFeeData
) {
  let fees = sliceState.byId[vaultId];

  if (!fees) {
    fees = sliceState.byId[vaultId] = {
      id: vaultId,
      ...data.performance,
      withdraw: data.withdraw,
      deposit: data.deposit,
    };
    sliceState.allIds.push(vaultId);
  }

  return fees;
}
