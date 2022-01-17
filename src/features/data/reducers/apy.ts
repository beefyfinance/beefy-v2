import { createSlice } from '@reduxjs/toolkit';
import { Vault } from '../entities/vault';

interface ApyGovVault {
  vaultApr: number;
}
interface ApyMaxiVault {
  totalApy: number;
}
interface ApyStandard {
  vaultApr: number;
  compoundingsPerYear: number;
  vaultApy: Number;
  tradingApr?: number;
  totalApy: number;
  // todo: does it make sense to have fees and apy in the same entities?
  lpFee: number;
}
type ApyData = ApyGovVault | ApyMaxiVault | ApyStandard;

// todo: create type guards to simplify usage

/**
 * State containing APY infos indexed by vault id
 */
export interface ApyState {
  byVaultId: {
    [vaultId: Vault['id']]: ApyData;
  };
}
const initialState: ApyState = { byVaultId: {} };

export const apySlice = createSlice({
  name: 'apy',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // todo: handle actions
  },
});
