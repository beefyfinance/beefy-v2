import { createSlice } from '@reduxjs/toolkit';
import { entries } from '../../../helpers/object.ts';
import { fetchAllVaults } from '../actions/vaults.ts';
import {
  calculateZapAvailabilityAction,
  fetchZapAggregatorTokenSupportAction,
  fetchZapAmmsAction,
  fetchZapConfigsAction,
  fetchZapSwapAggregatorsAction,
} from '../actions/zap.ts';
import type { VaultEntity } from '../entities/vault.ts';
import { isNonEmptyArray } from '../utils/array-utils.ts';
import type { ZapsState } from './zaps-types.ts';

const initialZapsState: ZapsState = {
  zaps: {
    byChainId: {},
  },
  aggregators: {
    allIds: [],
    byId: {},
    byChainId: {},
  },
  amms: {
    byId: {},
    byChainId: {},
  },
  swaps: {
    byChainId: {},
  },
  tokens: {
    byChainId: {},
  },
  vaults: {
    byId: {},
  },
};

export const zapsSlice = createSlice({
  name: 'zaps',
  initialState: initialZapsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder
      .addCase(fetchZapConfigsAction.fulfilled, (sliceState, action) => {
        for (const zap of action.payload.zaps) {
          sliceState.zaps.byChainId[zap.chainId] = zap;
        }
      })
      .addCase(fetchZapSwapAggregatorsAction.fulfilled, (sliceState, action) => {
        for (const aggregator of action.payload.aggregators) {
          // Aggregator
          if (!sliceState.aggregators.byId[aggregator.id]) {
            sliceState.aggregators.byId[aggregator.id] = aggregator;
            sliceState.aggregators.allIds.push(aggregator.id);
          } else {
            console.warn(`Ignoring duplicate aggregator id ${aggregator.id}`);
          }

          let aggByChainId = sliceState.aggregators.byChainId[aggregator.chainId];
          if (!aggByChainId) {
            aggByChainId = sliceState.aggregators.byChainId[aggregator.chainId] = {
              allIds: [],
              byType: {},
            };
          }

          let aggByType = aggByChainId.byType[aggregator.type];
          if (!aggByType) {
            aggByType = aggByChainId.byType[aggregator.type] = aggregator.id;
            aggByChainId.allIds.push(aggregator.id);
          } else {
            console.warn(
              `Ignoring duplicate aggregator type ${aggregator.type} for chain ${aggregator.chainId}`
            );
          }

          // Priority Tokens
          let tokensByChain = sliceState.tokens.byChainId[aggregator.chainId];
          if (!tokensByChain) {
            tokensByChain = sliceState.tokens.byChainId[aggregator.chainId] = { scoreById: {} };
            for (const tokenId of aggregator.priorityTokens) {
              tokensByChain.scoreById[tokenId] = (tokensByChain.scoreById[tokenId] || 0) + 1;
            }
          }
        }
      })
      .addCase(fetchAllVaults.fulfilled, (sliceState, action) => {
        // Start with any vault with a zap config being available
        sliceState.vaults.byId = Object.values(action.payload.byChainId)
          .flat()
          .reduce(
            (acc, vault) => {
              if (isNonEmptyArray(vault.entity.zaps)) {
                acc[vault.entity.id] = true;
              }
              return acc;
            },
            {} as Record<VaultEntity['id'], boolean>
          );
      })
      .addCase(fetchZapAmmsAction.fulfilled, (sliceState, action) => {
        for (const [chainId, amms] of entries(action.payload.byChainId)) {
          if (!amms) {
            continue;
          }

          sliceState.amms.byChainId[chainId] = amms;

          for (const amm of amms) {
            if (!(amm.id in sliceState.amms.byId)) {
              sliceState.amms.byId[amm.id] = amm;
            } else {
              console.warn(`Duplicate amm id ${amm.id}`);
            }
          }
        }
      })
      .addCase(fetchZapAggregatorTokenSupportAction.fulfilled, (sliceState, action) => {
        for (const [chainId, swapSupport] of entries(action.payload)) {
          if (!swapSupport) {
            continue;
          }

          sliceState.swaps.byChainId[chainId] ??= { byProvider: {}, byAddress: {} };

          sliceState.swaps.byChainId[chainId].byProvider = Object.entries(swapSupport).reduce(
            (acc, [address, providers]) => {
              for (const [provider, supported] of Object.entries(providers)) {
                if (supported) {
                  if (!acc[provider]) {
                    acc[provider] = [];
                  }
                  acc[provider].push(address);
                }
              }
              return acc;
            },
            {} as Record<string, string[]>
          );

          sliceState.swaps.byChainId[chainId].byAddress = Object.entries(swapSupport).reduce(
            (acc, [address, providers]) => {
              const supported = Object.entries(providers)
                .filter(([_, supported]) => supported)
                .map(([provider, _]) => provider);
              if (supported.length) {
                acc[address.toLowerCase()] = supported;
              }

              return acc;
            },
            {} as Record<string, string[]>
          );
        }
      })
      .addCase(calculateZapAvailabilityAction.fulfilled, (sliceState, action) => {
        // Later we have data to know if a vault actually supports zaps (i.e. a swap aggregator is available for its tokens)
        sliceState.vaults.byId = action.payload.vaultIds.reduce(
          (acc, vaultId) => {
            acc[vaultId] = true;
            return acc;
          },
          {} as Record<VaultEntity['id'], boolean>
        );
      });
  },
});
