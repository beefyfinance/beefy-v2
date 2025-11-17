import { createSlice } from '@reduxjs/toolkit';
import type { Draft } from 'immer';
import {
  fetchChainConfigs,
  restoreDefaultRpcsOnSingleChain,
  updateActiveRpc,
} from '../actions/chains.ts';
import type { ChainsState } from './chains-types.ts';

export const initialChainsState: ChainsState = {
  byId: {},
  allIds: [],
  activeIds: [],
  eolIds: [],
  chainIdByNetworkChainId: {},
  activeRpcsByChainId: {},
};

export const chainsSlice = createSlice({
  name: 'chains',
  initialState: initialChainsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchChainConfigs.fulfilled, (sliceState: Draft<ChainsState>, action) => {
      const timestampNow = Date.now() / 1000;
      const { chainConfigs, localRpcs } = action.payload;
      for (const chain of chainConfigs) {
        // completely skip disabled chains that we can't interact with
        if (chain.disabled) {
          continue;
        }
        // we already know this chain
        if (chain.id in sliceState.byId) {
          continue;
        }
        // save and index
        sliceState.byId[chain.id] = chain;
        sliceState.chainIdByNetworkChainId[chain.networkChainId] = chain.id;
        sliceState.allIds.push(chain.id);
        sliceState[chain.eol && timestampNow > chain.eol ? 'eolIds' : 'activeIds'].push(chain.id);

        // If a custom RPC was set in local storage, use that instead of the default
        const rpcs = localRpcs[chain.id] || chain.rpc;
        sliceState.activeRpcsByChainId[chain.id] = { rpcs };
      }

      sliceState.allIds = [...sliceState.allIds].sort((a, b) => a.localeCompare(b));
      sliceState.activeIds = [...sliceState.activeIds].sort((a, b) => a.localeCompare(b));
      sliceState.eolIds = [...sliceState.eolIds].sort((a, b) => a.localeCompare(b));
    });

    builder.addCase(updateActiveRpc, (sliceState, action) => {
      const { chainId, rpcUrl } = action.payload;
      if (!sliceState.activeRpcsByChainId[chainId]) {
        console.warn('Attempting to set an rpc on an unsupported chain');
      }
      const updatedRpcs = [rpcUrl];
      sliceState.activeRpcsByChainId[chainId] = { rpcs: updatedRpcs };
    });

    builder.addCase(restoreDefaultRpcsOnSingleChain, (sliceState, action) => {
      const { chainId } = action.payload;
      if (!sliceState.byId[chainId]) {
        return console.warn('Attempting to restore default rpcs on an unsupported chain');
      }
      const defaultChainRpcs = sliceState.byId[chainId].rpc;
      sliceState.activeRpcsByChainId[chainId] = { rpcs: defaultChainRpcs };
    });
  },
});
