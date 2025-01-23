import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { isEqual, mapValues } from 'lodash-es';
import { fetchAllBoosts } from '../actions/boosts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens';
import type {
  BoostContractData,
  FetchAllContractDataResult,
} from '../apis/contract-data/contract-data-types';
import type { BoostCampaignEntity, BoostEntity, BoostPartnerEntity } from '../entities/boost';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import type { NormalizedEntity } from '../utils/normalized-entity';
import type { BoostConfig } from '../apis/config-types';
import { datesAreEqual } from '../../../helpers/date';
import { entries } from '../../../helpers/object';

export type BoostContractState = BoostContractData;

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
    [chainId in ChainEntity['id']]?: {
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
  partners: {
    allIds: BoostPartnerEntity['id'][];
    byId: Record<BoostPartnerEntity['id'], BoostPartnerEntity>;
  };
  campaigns: {
    allIds: BoostCampaignEntity['id'][];
    byId: Record<BoostCampaignEntity['id'], BoostCampaignEntity>;
  };
};

export const initialBoostsState: BoostsState = {
  byId: {},
  allIds: [],
  byVaultId: {},
  byChainId: {},
  contractState: {},
  partners: {
    allIds: [],
    byId: {},
  },
  campaigns: {
    allIds: [],
    byId: {},
  },
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
    builder.addCase(fetchAllBoosts.fulfilled, (sliceState, action) => {
      for (const [chainId, boosts] of entries(action.payload.boostsByChainId)) {
        for (const boost of boosts) {
          addBoostToState(sliceState, chainId, boost);
        }
      }

      sliceState.partners.allIds = Object.keys(action.payload.partnersById);
      sliceState.partners.byId = mapValues(action.payload.partnersById, (config, key) => ({
        id: key,
        ...config,
      }));

      sliceState.campaigns.allIds = Object.keys(action.payload.campaignsById);
      sliceState.campaigns.byId = mapValues(action.payload.campaignsById, (config, key) => ({
        id: key,
        ...config,
      }));
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
  sliceState: Draft<BoostsState>,
  contractData: FetchAllContractDataResult
) {
  for (const boostContractData of contractData.boosts) {
    const contractState = sliceState.contractState[boostContractData.id];
    if (
      contractState === undefined ||
      contractState.isPreStake !== boostContractData.isPreStake ||
      contractState.rewards.length !== boostContractData.rewards.length ||
      !contractState.totalSupply.eq(boostContractData.totalSupply) ||
      !datesAreEqual(contractState.periodFinish, boostContractData.periodFinish) ||
      boostContractData.rewards.some((rewardContract, i) => {
        const rewardState = contractState.rewards[i];
        return (
          rewardState === undefined ||
          rewardState.isPreStake !== rewardContract.isPreStake ||
          rewardState.index !== rewardContract.index ||
          !rewardState.rewardRate.eq(rewardContract.rewardRate) ||
          rewardState.token.address !== rewardContract.token.address ||
          rewardState.token.chainId !== rewardContract.token.chainId ||
          !datesAreEqual(rewardState.periodFinish, rewardContract.periodFinish)
        );
      })
    ) {
      sliceState.contractState[boostContractData.id] = { ...boostContractData };
    }
  }

  // we also want to create the list of active and prestake boost ids
  updateBoostStatus(sliceState);
}

export function getBoostStatusFromContractState(
  boostId: BoostEntity['id'],
  contractState: Pick<BoostContractState, 'isPreStake' | 'periodFinish'>,
  now = new Date()
) {
  //Boost that got wrongly set to preStake after finished and won't be refilled
  if (['moo_solarbeam-wstksm-xcksm-lido'].includes(boostId)) {
    return 'expired';
  }
  if (contractState === null || contractState.isPreStake) {
    return 'prestake';
  } else if (contractState.periodFinish === undefined) {
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

function updateBoostStatus(sliceState: Draft<BoostsState>) {
  const now = new Date();

  for (const boostData of [sliceState.byVaultId, sliceState.byChainId]) {
    for (const entityData of Object.values(boostData)) {
      const activeBoostsIds: string[] = [];
      const expiredBoostsIds: string[] = [];
      const prestakeBoostsIds: string[] = [];

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
  sliceState: Draft<BoostsState>,
  chainId: ChainEntity['id'],
  apiBoost: BoostConfig
) {
  if (apiBoost.id in sliceState.byId) {
    return;
  }

  const boost: BoostEntity = {
    id: apiBoost.id,
    chainId: chainId,
    assets: apiBoost.assets || [],
    earnedTokenAddress: apiBoost.earnedTokenAddress,
    contractAddress: apiBoost.earnContractAddress,
    tagIcon: apiBoost.tagIcon || undefined,
    tagText: apiBoost.tagText || undefined,
    name: apiBoost.name,
    partnerIds: apiBoost.partners?.length ? apiBoost.partners : [],
    campaignId: apiBoost.campaign ? apiBoost.campaign : undefined,
    vaultId: apiBoost.poolId,
    version: apiBoost.version || 1,
  };
  sliceState.byId[boost.id] = boost;
  sliceState.allIds.push(boost.id);

  // add to vault id index
  const vaultState = getOrCreateBoostsVaultState(sliceState, boost.vaultId);
  vaultState.allBoostsIds.push(boost.id);

  // add to chain id index
  const chainState = getOrCreateBoostsChainState(sliceState, chainId);
  chainState.allBoostsIds.push(boost.id);
}

function getOrCreateBoostsVaultState(state: Draft<BoostsState>, vaultId: VaultEntity['id']) {
  let vaultState = state.byVaultId[vaultId];
  if (!vaultState) {
    vaultState = state.byVaultId[vaultId] = {
      allBoostsIds: [],
      activeBoostsIds: [],
      prestakeBoostsIds: [],
      expiredBoostsIds: [],
    };
  }
  return vaultState;
}

function getOrCreateBoostsChainState(state: Draft<BoostsState>, chainId: ChainEntity['id']) {
  let chainState = state.byChainId[chainId];
  if (!chainState) {
    chainState = state.byChainId[chainId] = {
      allBoostsIds: [],
      activeBoostsIds: [],
      prestakeBoostsIds: [],
      expiredBoostsIds: [],
    };
  }
  return chainState;
}
