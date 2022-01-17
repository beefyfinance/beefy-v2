import { createSlice } from '@reduxjs/toolkit';
import { fetchBoostsByChainIdAction } from '../actions/boosts';
import { BoostEntity } from '../entities/boost';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type BoostsState = NormalizedEntity<BoostEntity> & {
  // maybe make this only active boosts
  byVaultId: {
    [vaultId: VaultEntity['id']]: BoostEntity['id'][];
  };
};
export const initialBoostsState: BoostsState = { byId: {}, allIds: [], byVaultId: {} };

export const boostsSlice = createSlice({
  name: 'boosts',
  initialState: initialBoostsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when boost list is fetched, add all new tokens
    builder.addCase(fetchBoostsByChainIdAction.fulfilled, (state, action) => {
      const chainId = action.payload.chainId;
      for (const apiBoost of action.payload.boosts) {
        if (state.byId[apiBoost.id] === undefined) {
          const boost: BoostEntity = {
            id: apiBoost.id,
            chainId: chainId,
            assets: apiBoost.assets,
            contractAddress: apiBoost.earnContractAddress,
            earnedTokenId: apiBoost.earnedOracleId,
            logo: apiBoost.logo,
            name: apiBoost.name,
            partnerIds: apiBoost.partners.map(p => p.website),
            status: apiBoost.status as BoostEntity['status'],
            vaultId: apiBoost.poolId,
          };
          state.byId[boost.id] = boost;
          state.allIds.push(boost.id);
          if (state.byVaultId[boost.vaultId] === undefined) {
            state.byVaultId[boost.vaultId] = [];
          }
          state.byVaultId[boost.vaultId].push(boost.id);
        }
      }
    });
  },
});
