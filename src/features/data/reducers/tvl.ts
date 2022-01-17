import { createSlice } from '@reduxjs/toolkit';
import { Boost } from '../entities/boost';
import { Token } from '../entities/token';
import { Vault } from '../entities/vault';

// todo: entity WIP
interface VaultTvl {
  token: Token['id'];
  // no need for big numbers here
  amount: number;
}

interface BoostTvl {
  // TODO: how are these different?
  stacked: number;
  tvl: number;
}

/**
 * State containing APY infos indexed by vault id
 */
export interface TvlState {
  byVaultId: {
    [vaultId: Vault['id']]: VaultTvl;
  };
  byBoostId: {
    [boostId: Boost['id']]: BoostTvl;
  };

  /**
   * so bifi-gov and bifi-maxi, are very special
   * those are the way in which we distribute platform revenue back to bifi holders
   * bifi-gov is stake BIFI earn NATIVE (gas token) without autocompounding
   * bifi-maxi is stake BIFI earn BIFI with autocompounding
   * bifi-maxi basically uses bifi-gov underneath
   * so all the money in BIFI-MAXI is actually inside the BIFI-GOV of that chain
   * so in order not to count TVL twice. when we count the tvl of the gov pools
   * we must exclude/substract the tvl from the maxi vault
   */
  exclusions: {
    [vaultId: Vault['id']]: Vault['id'];
  };
}
const initialState: TvlState = { byVaultId: {}, byBoostId: {}, exclusions: {} };

export const tvlSlice = createSlice({
  name: 'tvl',
  initialState: initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // todo: handle actions
  },
});
