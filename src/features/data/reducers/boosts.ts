import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { fetchAllBoosts } from '../actions/boosts';
import { BoostConfig } from '../apis/config';
import { BoostEntity, isBoostActive } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type BoostsState = NormalizedEntity<BoostEntity> & {
  byVaultId: {
    [vaultId: VaultEntity['id']]: {
      allBoostsIds: BoostEntity['id'][];
      activeBoostsIds: BoostEntity['id'][];
    };
  };
  byChainId: {
    [chainId: ChainEntity['id']]: {
      allBoostsIds: BoostEntity['id'][];
      activeBoostsIds: BoostEntity['id'][];
    };
  };
};
export const initialBoostsState: BoostsState = {
  byId: {},
  allIds: [],
  byVaultId: {},
  byChainId: {},
};

export const boostsSlice = createSlice({
  name: 'boosts',
  initialState: initialBoostsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    // when boost list is fetched, add all new tokens
    builder.addCase(fetchAllBoosts.fulfilled, (sliceState, action) => {
      for (const [chainId, boosts] of Object.entries(action.payload)) {
        for (const boost of boosts) {
          addBoostToState(sliceState, chainId, boost);
        }
      }
    });
  },
});

function addBoostToState(
  sliceState: WritableDraft<BoostsState>,
  chainId: ChainEntity['id'],
  apiBoost: BoostConfig
) {
  if (apiBoost.id in sliceState.byId) {
    return;
  }

  const boost: BoostEntity = {
    id: apiBoost.id,
    chainId: chainId,
    assets: apiBoost.assets,
    earnedTokenId: apiBoost.earnedOracleId,
    earnContractAddress: apiBoost.earnContractAddress,
    logo: apiBoost.logo,
    name: apiBoost.name,
    partnerIds: apiBoost.partners.map(p => p.website),
    status: apiBoost.status as BoostEntity['status'],
    vaultId: apiBoost.poolId,
  };
  sliceState.byId[boost.id] = boost;
  sliceState.allIds.push(boost.id);

  // add to vault id index
  if (sliceState.byVaultId[boost.vaultId] === undefined) {
    sliceState.byVaultId[boost.vaultId] = { allBoostsIds: [], activeBoostsIds: [] };
  }
  sliceState.byVaultId[boost.vaultId].allBoostsIds.push(boost.id);
  if (isBoostActive(boost)) {
    sliceState.byVaultId[boost.vaultId].activeBoostsIds.push(boost.id);
  }

  // add to chain id index
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = { allBoostsIds: [], activeBoostsIds: [] };
  }
  sliceState.byChainId[chainId].allBoostsIds.push(boost.id);
  if (isBoostActive(boost)) {
    sliceState.byChainId[chainId].activeBoostsIds.push(boost.id);
  }
}
