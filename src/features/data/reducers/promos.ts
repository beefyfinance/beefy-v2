import { createSlice } from '@reduxjs/toolkit';
import { getUnixTime } from 'date-fns';
import type { Draft } from 'immer';
import { isEqual, keyBy, pick } from 'lodash-es';
import { datesAreEqual, getUnixNow } from '../../../helpers/date.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { initPromos, promosRecalculatePinned } from '../actions/promos.ts';
import { fetchOffChainCampaignsAction } from '../actions/rewards.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import type { BeefyOffChainRewardsCampaign } from '../apis/beefy/beefy-api-types.ts';
import type {
  BoostContractData,
  FetchAllContractDataResult,
  GovVaultMultiContractData,
} from '../apis/contract-data/contract-data-types.ts';
import type {
  OffChainPromoEntity,
  PoolPromoEntity,
  PromoCampaignEntity,
  PromoEntity,
  PromoPartnerEntity,
} from '../entities/promo.ts';
import type { OffchainRewardData, PromosState } from './promos-types.ts';

export const initialPromosState: PromosState = {
  byId: {},
  allIds: [],
  byVaultId: {},
  byType: {},
  statusById: {},
  dataByType: { boost: {}, pool: {}, offchain: {} },
  partners: {
    allIds: [],
    byId: {},
  },
  campaigns: {
    allIds: [],
    byId: {},
  },
  pinned: {
    configs: [],
    byId: {},
  },
};

export const promosSlice = createSlice({
  name: 'promos',
  initialState: initialPromosState,
  reducers: {
    recalculatePromoStatuses: sliceState => {
      updateStatuses(sliceState);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initPromos.fulfilled, (sliceState, action) => {
        addPromosToState(sliceState, action.payload.promos);
        addPartnersToState(sliceState.partners, action.payload.partners);
        addCampaignsToState(sliceState.campaigns, action.payload.campaigns);
        sliceState.pinned.configs = action.payload.pinned;
      })
      .addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
        addContractDataToState(sliceState, action.payload.contractData);
      })
      .addCase(
        reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
        (sliceState, action) => {
          addContractDataToState(sliceState, action.payload.contractData);
        }
      )
      .addCase(promosRecalculatePinned.fulfilled, (sliceState, action) => {
        if (!isEqual(sliceState.pinned.byId, action.payload.byId)) {
          sliceState.pinned.byId = action.payload.byId;
        }
      })
      .addCase(fetchOffChainCampaignsAction.fulfilled, (sliceState, action) => {
        addOffChainDataToState(sliceState, action.payload.campaigns);
      });
  },
});

function addContractDataToState(sliceState: Draft<PromosState>, data: FetchAllContractDataResult) {
  addBoostDataToState(sliceState, data.boosts);
  addPoolDataToState(sliceState, data.govVaultsMulti);
  updateStatuses(sliceState);
}

function getStatusFromTime(promo: PromoEntity, initialStatus?: PromoEntity['status']) {
  let status: PromoEntity['status'] = initialStatus || promo.status;
  if (promo.startTime || promo.endTime) {
    const now = getUnixNow();
    if (promo.startTime && now < promo.startTime) {
      status = 'inactive';
    } else if (promo.endTime && now > promo.endTime) {
      status = 'inactive';
    } else {
      status = promo.status;
    }
  }
  return status;
}

function addPromosToState(sliceState: Draft<PromosState>, promos: PromoEntity[]) {
  const allIds: PromosState['allIds'] = [];
  const byId: PromosState['byId'] = {};
  const byType: PromosState['byType'] = {};
  const byVaultId: PromosState['byVaultId'] = {};

  // @dev build new objects so hot-reloading works
  for (const promo of promos) {
    allIds.push(promo.id);
    byId[promo.id] = promo;

    byType[promo.type] ??= { allIds: [], byChainId: {} };
    byType[promo.type]!.allIds.push(promo.id);
    byType[promo.type]!.byChainId[promo.chainId] ??= { allIds: [] };
    byType[promo.type]!.byChainId[promo.chainId]!.allIds.push(promo.id);

    byVaultId[promo.vaultId] ??= { allIds: [], byType: {} };
    byVaultId[promo.vaultId].allIds.push(promo.id);
    byVaultId[promo.vaultId].byType[promo.type] ??= { allIds: [] };
    byVaultId[promo.vaultId].byType[promo.type]!.allIds.push(promo.id);

    // default status from config
    if (!sliceState.statusById[promo.id]) {
      sliceState.statusById[promo.id] = getStatusFromTime(promo);
    }
  }

  // @dev only loaded once so can just replace, no optimization needed
  sliceState.allIds = allIds;
  sliceState.byId = byId;
  sliceState.byType = byType;
  sliceState.byVaultId = byVaultId;
}

function addPartnersToState(
  partnersState: Draft<PromosState>['partners'],
  partners: PromoPartnerEntity[]
) {
  /// @dev only loaded once so can just replace, no optimization needed
  partnersState.byId = keyBy(partners, p => p.id);
  partnersState.allIds = Object.keys(partnersState.byId);
}

function addCampaignsToState(
  campaignsState: Draft<PromosState>['campaigns'],
  campaigns: PromoCampaignEntity[]
) {
  // @dev only loaded once so can just replace, no optimization needed
  campaignsState.byId = keyBy(campaigns, c => c.id);
  campaignsState.allIds = Object.keys(campaignsState.byId);
}

function addOffChainDataToState(
  sliceState: Draft<PromosState>,
  campaigns: BeefyOffChainRewardsCampaign[]
) {
  const byVaultId: PromosState['dataByType']['offchain'] = {};

  for (const campaign of campaigns) {
    const base = pick(campaign, ['type', 'startTimestamp', 'endTimestamp', 'rewardToken']);
    for (const vault of campaign.vaults) {
      byVaultId[vault.id] ??= [];
      byVaultId[vault.id].push({ ...base, apr: vault.apr });
    }
  }

  sliceState.dataByType.offchain = byVaultId;
}

function addBoostDataToState(
  sliceState: Draft<PromosState>,
  contractData: FetchAllContractDataResult['boosts']
) {
  for (const boost of contractData) {
    const contractState = sliceState.dataByType.boost[boost.id];
    if (
      contractState === undefined ||
      contractState.isPreStake !== boost.isPreStake ||
      contractState.rewards.length !== boost.rewards.length ||
      !contractState.totalSupply.eq(boost.totalSupply) ||
      !datesAreEqual(contractState.periodFinish, boost.periodFinish) ||
      boost.rewards.some((rewardContract, i) => {
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
      sliceState.dataByType.boost[boost.id] = { ...boost };
    }
  }
}

function addPoolDataToState(
  sliceState: Draft<PromosState>,
  contractData: FetchAllContractDataResult['govVaultsMulti']
) {
  for (const pool of contractData) {
    const contractState = sliceState.dataByType.boost[pool.id];
    if (
      contractState === undefined ||
      contractState.rewards.length !== pool.rewards.length ||
      !contractState.totalSupply.eq(pool.totalSupply) ||
      pool.rewards.some((rewardContract, i) => {
        const rewardState = contractState.rewards[i];
        return (
          rewardState === undefined ||
          rewardState.index !== rewardContract.index ||
          !rewardState.rewardRate.eq(rewardContract.rewardRate) ||
          rewardState.token.address !== rewardContract.token.address ||
          rewardState.token.chainId !== rewardContract.token.chainId ||
          !datesAreEqual(rewardState.periodFinish, rewardContract.periodFinish)
        );
      })
    ) {
      sliceState.dataByType.pool[pool.id] = { ...pool };
    }
  }
}

function updateStatuses(sliceState: Draft<PromosState>) {
  const now = getUnixNow();

  for (const id of sliceState.allIds) {
    const promo = sliceState.byId[id];
    if (!promo) {
      throw new Error(`Promo ${id} not found`);
    }

    const currentStatus = sliceState.statusById[id];
    let newStatus = currentStatus;

    if (promo.type === 'boost') {
      const contractState = sliceState.dataByType.boost[id];
      if (contractState) {
        newStatus = getBoostStatusFromContractState(contractState, now);
      }
    } else if (promo.type === 'pool') {
      const contractState = sliceState.dataByType.pool[promo.vaultId];
      if (contractState) {
        newStatus = getPoolStatusFromContractState(
          promo,
          contractState as GovVaultMultiContractData,
          now
        );
      }
    } else if (promo.type === 'offchain') {
      const offchainData = sliceState.dataByType.offchain[promo.vaultId];
      if (offchainData) {
        newStatus = getOffChainStatusFromData(promo, offchainData, now);
      }
    }

    // allow config start/end time to override contract status
    newStatus = getStatusFromTime(promo, newStatus || promo.status);

    if (currentStatus !== newStatus) {
      sliceState.statusById[id] = newStatus;
    }
  }
}

function getOffChainStatusFromData(
  promo: OffChainPromoEntity,
  data: OffchainRewardData[],
  now?: number
) {
  const nowTimestamp = now || getUnixNow();
  const matchingCampaigns = data.filter(
    c => c.type === promo.campaignType && c.endTimestamp > nowTimestamp
  );
  const activeCampaigns = matchingCampaigns.filter(
    c => c.apr > 0 && c.startTimestamp < nowTimestamp
  );
  if (activeCampaigns.length > 0) {
    return 'active';
  }
  const prestakeCampaigns = matchingCampaigns.filter(c => c.startTimestamp > nowTimestamp);
  return prestakeCampaigns.length > 0 ? 'prestake' : 'inactive';
}

function getPoolStatusFromContractState(
  promo: PoolPromoEntity,
  contractState: GovVaultMultiContractData,
  now?: number
) {
  const nowTimestamp = now || getUnixNow();
  const activeRewards = contractState.rewards.filter(contractReward =>
    promo.rewards.some(
      configReward =>
        configReward.chainId === contractReward.token.chainId &&
        configReward.address === contractReward.token.address &&
        contractReward.rewardRate.gt(0) &&
        contractReward.periodFinish &&
        getUnixTime(contractReward.periodFinish) > nowTimestamp
    )
  );
  return activeRewards.length > 0 ? 'active' : 'inactive';
}

export function getBoostStatusFromContractState(
  contractState: Pick<BoostContractData, 'isPreStake' | 'periodFinish'>,
  now?: number
) {
  if (contractState === null || contractState.isPreStake) {
    return 'prestake';
  } else if (contractState.periodFinish === undefined) {
    // latest boost contract allows to start without prestake so as to hide in app if deployed too early
    return 'inactive';
  }
  const nowTimestamp = now || getUnixNow();
  const periodFinishTimestamp = getUnixTime(contractState.periodFinish);
  if (nowTimestamp < periodFinishTimestamp) {
    return 'active';
  } else {
    return 'inactive';
  }
}

export const { recalculatePromoStatuses } = promosSlice.actions;
export const promosReducer = promosSlice.reducer;
