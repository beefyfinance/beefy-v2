import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { BoostEntity } from '../entities/boost';
import { TokenEntity } from '../entities/token';
import { VaultEntity } from '../entities/vault';

// todo: entity WIP
interface VaultTvl {
  token: TokenEntity['id'];
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
  totalTvl: BigNumber;
  byVaultId: {
    [vaultId: VaultEntity['id']]: VaultTvl;
  };
  byBoostId: {
    [boostId: BoostEntity['id']]: BoostTvl;
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
    [vaultId: VaultEntity['id']]: VaultEntity['id'];
  };
}
const initialState: TvlState = {
  totalTvl: new BigNumber(0),
  byVaultId: {},
  byBoostId: {},
  exclusions: {},
};

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
