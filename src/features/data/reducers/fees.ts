import { createSlice } from '@reduxjs/toolkit';
import { entries } from '../../../helpers/object.ts';
import { fetchFees } from '../actions/fees.ts';
import type { ApyVaultFeeData } from '../apis/beefy/beefy-api-types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { FeesState } from './fees-types.ts';

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
            if (value === undefined) {
              delete fees[key];
            } else {
              fees[key] = value;
            }
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
