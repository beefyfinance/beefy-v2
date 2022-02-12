import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { isEqual } from 'lodash';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { BoostConfig } from '../apis/config';
import { BoostEntity } from '../entities/boost';
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
      prestakeBoostsIds: BoostEntity['id'][];
      activeBoostsIds: BoostEntity['id'][];
      expiredBoostsIds: BoostEntity['id'][];
    };
  };
  byChainId: {
    [chainId: ChainEntity['id']]: {
      allBoostsIds: BoostEntity['id'][];
      prestakeBoostsIds: BoostEntity['id'][];
      activeBoostsIds: BoostEntity['id'][];
      expiredBoostsIds: BoostEntity['id'][];
    };
  };
  // put the period finish in another part of the state
  // to avoid re-rendering of non-updateable boost data
  periodfinish: {
    [boostId: BoostEntity['id']]: Date;
  };
};
export const initialBoostsState: BoostsState = {
  byId: {},
  allIds: [],
  byVaultId: {},
  byChainId: {},
  periodfinish: {},
};

export const boostsSlice = createSlice({
  name: 'boosts',
  initialState: initialBoostsState,
  reducers: {
    recomputeBoostStatus(sliceState) {
      updateBoostStatus(sliceState);
    },
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
    // handle period finish data
    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      for (const boostContractData of action.payload.data.boosts) {
        if (
          sliceState.periodfinish[boostContractData.id] === undefined ||
          sliceState.periodfinish[boostContractData.id].getTime() !==
            boostContractData.periodFinish.getTime()
        ) {
          sliceState.periodfinish[boostContractData.id] = boostContractData.periodFinish;
        }
      }

      // we also want to create the list of active and prestake boost ids
      updateBoostStatus(sliceState);
    });
  },
});

export const { recomputeBoostStatus } = boostsSlice.actions;

export function getBoostStatusFromPeriodFinish(periodFinish: Date | null, now = new Date()) {
  if (!periodFinish) {
    return 'prestake';
  }
  const nowUTCTime = now.getTime();
  const pfUTCTime = periodFinish.getTime();
  if (nowUTCTime < pfUTCTime) {
    return 'active';
  } else {
    return 'expired';
  }
}

function updateBoostStatus(sliceState: WritableDraft<BoostsState>) {
  const now = new Date();

  for (const boostData of [sliceState.byVaultId, sliceState.byChainId]) {
    for (const entityData of Object.values(boostData)) {
      const activeBoostsIds = [];
      const expiredBoostsIds = [];
      const prestakeBoostsIds = [];

      for (const boostId of entityData.allBoostsIds) {
        const periodFinish = sliceState.periodfinish[boostId];
        if (periodFinish === undefined) {
          continue;
        }
        const status = getBoostStatusFromPeriodFinish(periodFinish, now);
        if (status === 'expired') {
          expiredBoostsIds.push(boostId);
        } else {
          // TODO: handle prestake status
          activeBoostsIds.push(boostId);
        }
      }

      activeBoostsIds.sort();
      expiredBoostsIds.sort();
      prestakeBoostsIds.sort();

      // update only if needed
      // we assume arrays in the state are sorted
      if (!isEqual(entityData.activeBoostsIds, activeBoostsIds)) {
        entityData.activeBoostsIds = activeBoostsIds;
      }
      if (!isEqual(entityData.expiredBoostsIds, expiredBoostsIds)) {
        entityData.expiredBoostsIds = expiredBoostsIds;
      }
      if (!isEqual(entityData.prestakeBoostsIds, prestakeBoostsIds)) {
        entityData.prestakeBoostsIds = prestakeBoostsIds;
      }
    }
  }
}

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
    partnerIds: apiBoost.partners ? apiBoost.partners.map(p => p.website) : [],
    vaultId: apiBoost.poolId,
  };
  sliceState.byId[boost.id] = boost;
  sliceState.allIds.push(boost.id);

  // add to vault id index
  if (sliceState.byVaultId[boost.vaultId] === undefined) {
    sliceState.byVaultId[boost.vaultId] = {
      allBoostsIds: [],
      activeBoostsIds: [],
      prestakeBoostsIds: [],
      expiredBoostsIds: [],
    };
  }
  // we don't know yet the status of this boost
  // we need the contract data
  sliceState.byVaultId[boost.vaultId].allBoostsIds.push(boost.id);

  // add to chain id index
  if (sliceState.byChainId[chainId] === undefined) {
    sliceState.byChainId[chainId] = {
      allBoostsIds: [],
      activeBoostsIds: [],
      prestakeBoostsIds: [],
      expiredBoostsIds: [],
    };
  }
  // we don't know yet the status of this boost
  // we need the contract data
  sliceState.byChainId[chainId].allBoostsIds.push(boost.id);
}
