import { createSlice } from '@reduxjs/toolkit';
import type { ChainEntity } from '../entities/chain';
import type { VaultEntity } from '../entities/vault';
import BigNumber from 'bignumber.js';
import { fetchClmHarvests, fetchClmPendingRewards } from '../actions/clm-harvests';

export interface Harvest {
  date: Date;
  compoundedAmount0: BigNumber;
  compoundedAmount1: BigNumber;
  token0ToUsd: BigNumber;
  token1ToUsd: BigNumber;
  totalSupply: BigNumber;
}

interface PendingRewards {
  fees0: BigNumber;
  fees1: BigNumber;
  totalSupply: BigNumber;
}

export interface ClmHarvestsState {
  byChainId: {
    [chainId in ChainEntity['id']]?: {
      harvests: {
        byVaultAddress: {
          [vaultAddress in VaultEntity['earnContractAddress']]?: {
            harvests?: Harvest[];
            pendingRewards?: PendingRewards;
          };
        };
      };
    };
  };
}

export const initialClmHarvestsState: ClmHarvestsState = {
  byChainId: {},
};

export const clmHarvestsSlice = createSlice({
  name: 'clmHarvests',
  initialState: initialClmHarvestsState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchClmHarvests.fulfilled, (sliceState, action) => {
      const { data, vaultAddress, chainId } = action.payload;

      const harvests: Harvest[] = data.map(row => ({
        date: new Date(Math.floor(Number(row.timestamp) * 1000)),
        compoundedAmount0: new BigNumber(row.compoundedAmount0),
        compoundedAmount1: new BigNumber(row.compoundedAmount1),
        token0ToUsd: new BigNumber(row.token0ToUsd),
        token1ToUsd: new BigNumber(row.token1ToUsd),
        totalSupply: new BigNumber(row.totalSupply),
      }));

      if (!sliceState.byChainId[chainId]?.harvests.byVaultAddress) {
        sliceState.byChainId[chainId] = {
          harvests: {
            byVaultAddress: {},
          },
        };
      }

      sliceState.byChainId[chainId]!.harvests.byVaultAddress[vaultAddress] = {
        ...sliceState.byChainId[chainId]!.harvests.byVaultAddress[vaultAddress],
        harvests: harvests,
      };
    });
    builder.addCase(fetchClmPendingRewards.fulfilled, (sliceState, action) => {
      const { data, vaultAddress, chainId } = action.payload;
      const { fees1, fees0, totalSupply } = data;

      if (!sliceState.byChainId[chainId]?.harvests.byVaultAddress) {
        sliceState.byChainId[chainId] = {
          harvests: {
            byVaultAddress: {},
          },
        };
      }
      sliceState.byChainId[chainId]!.harvests.byVaultAddress[vaultAddress] = {
        ...sliceState.byChainId[chainId]!.harvests.byVaultAddress[vaultAddress],
        pendingRewards: {
          fees1,
          fees0,
          totalSupply,
        },
      };
    });
  },
});
