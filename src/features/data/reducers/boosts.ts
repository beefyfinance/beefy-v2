import { createSlice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/internal';
import { isEqual } from 'lodash';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types';
import { BoostEntity } from '../entities/boost';
import { ChainEntity } from '../entities/chain';
import { VaultEntity } from '../entities/vault';
import { NormalizedEntity } from '../utils/normalized-entity';
import { BoostConfig } from '../apis/config-types';
import { datesAreEqual } from '../../../helpers/date';

export type BoostContractState = {
  periodFinish: Date | null;
  isPreStake: boolean;
};
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
  // null means prestake
  contractState: {
    [boostId: BoostEntity['id']]: BoostContractState;
  };
};

export const initialBoostsState: BoostsState = {
  byId: {},
  allIds: [],
  byVaultId: {},
  byChainId: {},
  contractState: {},
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
      addContractDataToState(sliceState, action.payload.data);
    });
    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        addContractDataToState(sliceState, action.payload.contractData);
      }
    );
  },
});

export const { recomputeBoostStatus } = boostsSlice.actions;

function addContractDataToState(
  sliceState: WritableDraft<BoostsState>,
  contractData: FetchAllContractDataResult
) {
  for (const boostContractData of contractData.boosts) {
    if (
      sliceState.contractState[boostContractData.id] === undefined ||
      sliceState.contractState[boostContractData.id] === null ||
      !datesAreEqual(
        boostContractData.periodFinish,
        sliceState.contractState[boostContractData.id].periodFinish
      ) ||
      sliceState.contractState[boostContractData.id].isPreStake !== boostContractData.isPreStake
    ) {
      sliceState.contractState[boostContractData.id] = {
        periodFinish: boostContractData.periodFinish,
        isPreStake: boostContractData.isPreStake,
      };
    }
  }

  // we also want to create the list of active and prestake boost ids
  updateBoostStatus(sliceState);
}

export function getBoostStatusFromContractState(
  boostId: BoostEntity['id'],
  contractState: BoostContractState,
  now = new Date()
) {
  //Boost that got wrongly set to preStake after finished and won't be refilled
  if (['moo_solarbeam-wstksm-xcksm-lido'].includes(boostId)) {
    return 'expired';
  }
  if (contractState === null || contractState.isPreStake) {
    return 'prestake';
  } else if (contractState.periodFinish === null) {
    // latest boost contract allows to start without prestake so as to hide in app if deployed too early
    return 'expired';
  }
  const nowUTCTime = now.getTime();
  const pfUTCTime = contractState.periodFinish.getTime();
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
        const contractState = sliceState.contractState[boostId];
        if (contractState === undefined) {
          continue;
        }
        const status = getBoostStatusFromContractState(boostId, contractState, now);
        if (status === 'expired') {
          expiredBoostsIds.push(boostId);
        } else if (status === 'prestake') {
          prestakeBoostsIds.push(boostId);
        } else if (status === 'active') {
          activeBoostsIds.push(boostId);
        } else {
          throw new Error(`Unknown boost status ${status} ${boostId}`);
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
    earnedTokenAddress: apiBoost.earnedTokenAddress,
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
