import { createSlice } from '@reduxjs/toolkit';
import BigNumber from 'bignumber.js';
import { fetchApyAction } from '../actions/apy';
import { fetchBoostContractDataAction } from '../actions/boost-contract';
import { ApyData } from '../apis/beefy';
import { BoostEntity } from '../entities/boost';
import { VaultEntity } from '../entities/vault';
import { selectBoostById } from '../selectors/boosts';
import { selectTokenPriceByTokenId } from '../selectors/token-prices';
import { selectTokenById } from '../selectors/tokens';
import { selectVaultPricePerFullShare } from '../selectors/tvl';
import { selectVaultById } from '../selectors/vaults';

// boost is expressed as APR
interface AprData {
  apr: number;
}
// todo: create type guards to simplify usage

/**
 * State containing APY infos indexed by vault id
 */
export interface ApyState {
  byVaultId: {
    // we reuse the api types, not the best idea but works for now
    [vaultId: VaultEntity['id']]: ApyData;
  };
  byBoostId: {
    [boostId: BoostEntity['id']]: AprData;
  };
}
export const initialApyState: ApyState = { byVaultId: {}, byBoostId: {} };

export const apySlice = createSlice({
  name: 'apy',
  initialState: initialApyState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchApyAction.fulfilled, (sliceState, action) => {
      for (const [vaultId, apy] of Object.entries(action.payload)) {
        sliceState.byVaultId[vaultId] = apy;
      }
    });

    builder.addCase(fetchBoostContractDataAction.fulfilled, (sliceState, action) => {
      const state = action.payload.state;

      for (const boostContractData of action.payload.data) {
        const boost = selectBoostById(state, boostContractData.id);
        const vault = selectVaultById(state, boost.vaultId);

        const token = selectTokenById(state, vault.oracleId);
        const tokenPrice = selectTokenPriceByTokenId(state, token.id);
        const earnedToken = selectTokenById(state, boost.earnedTokenId);
        const earnedTokenPrice = selectTokenPriceByTokenId(state, earnedToken.id);

        const totalStakedInUsd = boostContractData.totalStaked
          .times(tokenPrice)
          .dividedBy(token.decimals);

        const yearlyRewardsInUsd = boostContractData.rewardRate
          .times(3600 * 24 * 365)
          .times(earnedTokenPrice)
          .dividedBy(earnedToken.decimals);

        const apr = yearlyRewardsInUsd.dividedBy(totalStakedInUsd).toNumber();

        // add data to state
        sliceState.byBoostId[boost.id] = { apr };
      }
    });
  },
});
