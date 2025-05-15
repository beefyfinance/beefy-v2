import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import { sortBy } from 'lodash-es';
import { BIG_ZERO } from '../../../helpers/big-number.ts';
import { fromKeysBy, pushOrSet } from '../../../helpers/object.ts';
import { fetchAllContractDataByChainAction } from '../actions/contract-data.ts';
import { reloadBalanceAndAllowanceAndGovRewardsAndBoostData } from '../actions/tokens.ts';
import { fetchAllVaults, fetchVaultsLastHarvests } from '../actions/vaults.ts';
import type { FetchAllContractDataResult } from '../apis/contract-data/contract-data-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import { isStandardVault } from '../entities/vault.ts';
import type { VaultsState } from './vaults-types.ts';

export const initialVaultsState: VaultsState = {
  byId: {},
  allIds: [],
  allVisibleIds: [],
  allActiveIds: [],
  allBridgedIds: [],
  allChainIds: [],
  relations: {
    underlyingOf: {
      byId: {},
    },
    depositFor: {
      byId: {},
    },
  },
  byType: {
    standard: {
      allIds: [],
    },
    gov: {
      allIds: [],
    },
    cowcentrated: {
      allIds: [],
    },
    erc4626: {
      allIds: [],
    },
  },
  byChainId: {},
  contractData: { byVaultId: {} },
  lastHarvestById: {},
};

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialVaultsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
      for (const vaults of Object.values(action.payload.byChainId)) {
        for (const vault of vaults) {
          sliceState.byId[vault.entity.id] = vault.entity;
        }
      }
      rebuildVaultsState(sliceState);
    });

    builder.addCase(fetchAllContractDataByChainAction.fulfilled, (sliceState, action) => {
      addContractDataToState(sliceState, action.payload.contractData);
    });

    builder.addCase(fetchVaultsLastHarvests.fulfilled, (sliceState, action) => {
      for (const [vaultId, lastHarvest] of Object.entries(action.payload.byVaultId)) {
        // time in milliseconds since unix epoch
        sliceState.lastHarvestById[vaultId] = lastHarvest * 1000;
      }
    });

    builder.addCase(
      reloadBalanceAndAllowanceAndGovRewardsAndBoostData.fulfilled,
      (sliceState, action) => {
        addContractDataToState(sliceState, action.payload.contractData);
      }
    );
  },
});

function addContractDataToState(
  sliceState: Draft<VaultsState>,
  contractData: FetchAllContractDataResult
) {
  for (const vaultContractData of contractData.standardVaults) {
    const vaultId = vaultContractData.id;

    // only update it if needed
    if (sliceState.contractData.byVaultId[vaultId] === undefined) {
      sliceState.contractData.byVaultId[vaultId] = {
        pricePerFullShare: vaultContractData.pricePerFullShare,
        strategyAddress: vaultContractData.strategy,
      };
    }

    if (
      !sliceState.contractData.byVaultId[vaultId].pricePerFullShare?.isEqualTo(
        vaultContractData.pricePerFullShare
      )
    ) {
      sliceState.contractData.byVaultId[vaultId].pricePerFullShare =
        vaultContractData.pricePerFullShare;
    }

    if (sliceState.contractData.byVaultId[vaultId].strategyAddress !== vaultContractData.strategy) {
      sliceState.contractData.byVaultId[vaultId].strategyAddress = vaultContractData.strategy;
    }
  }

  for (const cowVaultContractData of contractData.cowVaults) {
    const vaultId = cowVaultContractData.id;

    if (sliceState.contractData.byVaultId[vaultId] === undefined) {
      sliceState.contractData.byVaultId[vaultId] = {
        balances: [BIG_ZERO, BIG_ZERO],
        strategyAddress: cowVaultContractData.strategy,
      };
    }

    if (
      !sliceState.contractData.byVaultId[vaultId].balances!.every((balance, index) => {
        return balance.isEqualTo(cowVaultContractData.balances[index]);
      })
    ) {
      sliceState.contractData.byVaultId[vaultId].balances = cowVaultContractData.balances;
    }

    if (
      sliceState.contractData.byVaultId[vaultId].strategyAddress !== cowVaultContractData.strategy
    ) {
      sliceState.contractData.byVaultId[vaultId].strategyAddress = cowVaultContractData.strategy;
    }
  }

  for (const vaultContractData of contractData.erc4626Vaults) {
    const vaultId = vaultContractData.id;

    // only update it if needed
    if (sliceState.contractData.byVaultId[vaultId] === undefined) {
      sliceState.contractData.byVaultId[vaultId] = {
        pricePerFullShare: vaultContractData.pricePerFullShare,
      };
    }

    if (
      !sliceState.contractData.byVaultId[vaultId].pricePerFullShare?.isEqualTo(
        vaultContractData.pricePerFullShare
      )
    ) {
      sliceState.contractData.byVaultId[vaultId].pricePerFullShare =
        vaultContractData.pricePerFullShare;
    }
  }
}

function createVaultsChainState(): VaultsState['byChainId'][ChainEntity['id']] {
  return {
    allIds: [],
    byAddress: {},
    byType: {
      standard: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
      gov: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
      cowcentrated: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
      erc4626: {
        allIds: [],
        byAddress: {},
        byDepositTokenAddress: {},
      },
    },
  };
}

function rebuildVaultsState(sliceState: Draft<VaultsState>) {
  const allIds = sortBy(Object.keys(sliceState.byId), id => {
    return -sliceState.byId[id]!.updatedAt;
  });
  const allVaults = allIds.map(id => sliceState.byId[id]!);
  const allVisibleIds = allVaults.filter(vault => !vault.hidden).map(vault => vault.id);
  const allChainIds = Array.from(
    allVaults
      .reduce((acc, vault) => {
        acc.add(vault.chainId);
        return acc;
      }, new Set<ChainEntity['id']>())
      .values()
  );

  const allActiveIds: VaultsState['allActiveIds'] = [];
  const allBridgedIds: VaultsState['allBridgedIds'] = [];
  const byType: VaultsState['byType'] = {
    standard: {
      allIds: [],
    },
    gov: {
      allIds: [],
    },
    cowcentrated: {
      allIds: [],
    },
    erc4626: {
      allIds: [],
    },
  };
  const byChainId: VaultsState['byChainId'] = fromKeysBy(allChainIds, () =>
    createVaultsChainState()
  );

  for (const vault of allVaults) {
    // global
    if (vault.status === 'active' && !vault.hidden) {
      allActiveIds.push(vault.id);
    }
    if (isStandardVault(vault) && !!vault.bridged) {
      allBridgedIds.push(vault.id);
    }

    // by type
    byType[vault.type].allIds.push(vault.id);

    // by chain
    const chainState = byChainId[vault.chainId]!;
    chainState.allIds.push(vault.id);
    chainState.byAddress[vault.contractAddress.toLowerCase()] = vault.id;

    // by vault type by chain
    const chainTypeState = chainState.byType[vault.type];
    chainTypeState.allIds.push(vault.id);
    chainTypeState.byAddress[vault.contractAddress.toLowerCase()] = vault.id;
    pushOrSet(
      chainTypeState.byDepositTokenAddress,
      vault.depositTokenAddress.toLowerCase(),
      vault.id
    );
  }

  // Update state
  sliceState.allIds = allIds;
  sliceState.allVisibleIds = allVisibleIds;
  sliceState.allChainIds = allChainIds;
  sliceState.allActiveIds = allActiveIds;
  sliceState.allBridgedIds = allBridgedIds;
  sliceState.byType = byType;
  sliceState.byChainId = byChainId;
  sliceState.relations = getVaultRelations(sliceState);
}

function getVaultRelations(sliceState: Draft<VaultsState>): VaultsState['relations'] {
  const underlyingOf: VaultsState['relations']['underlyingOf']['byId'] = {};
  const depositForById: VaultsState['relations']['depositFor']['byId'] = {};

  for (const chainSlice of Object.values(sliceState.byChainId)) {
    for (const vaultId of chainSlice.allIds) {
      const vault = sliceState.byId[vaultId];
      if (!vault) {
        continue;
      }
      const underlyingVaultId = chainSlice.byAddress[vault.depositTokenAddress.toLowerCase()];
      if (!underlyingVaultId) {
        continue;
      }
      const underlyingVault = sliceState.byId[underlyingVaultId];
      if (!underlyingVault) {
        continue;
      }

      // vaultId uses underlyingVaultId as its deposit token
      underlyingOf[vaultId] = underlyingVaultId;

      // underlyingVaultId is the deposit token for vaultId
      pushOrSet(depositForById, underlyingVaultId, vaultId);
    }
  }

  return {
    underlyingOf: {
      byId: underlyingOf,
    },
    depositFor: {
      byId: depositForById,
    },
  };
}
