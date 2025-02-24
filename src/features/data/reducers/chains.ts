import { createSlice } from '@reduxjs/toolkit';
import {
  fetchChainConfigs,
  restoreDefaultRpcsOnSingleChain,
  updateActiveRpc,
} from '../actions/chains';
import type { ChainEntity } from '../entities/chain';
import type { NormalizedEntity } from '../utils/normalized-entity';
import { omit } from 'lodash-es';
import type { Draft } from 'immer';
import { djb2Hash } from '../utils/string-utils';

type ActiveRpcConfig = {
  hash: number;
  rpcs: string[];
};
/**
 * State containing Vault infos
 */
export type ChainsState = NormalizedEntity<ChainEntity> & {
  activeIds: ChainEntity['id'][];
  eolIds: ChainEntity['id'][];
  chainIdByNetworkChainId: Record<ChainEntity['networkChainId'], ChainEntity['id']>;
  activeRpcsByChainId: { -readonly [id in ChainEntity['id']]?: ActiveRpcConfig };
};

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
      for (const chainConfig of chainConfigs) {
        // we already know this chain
        if (chainConfig.id in sliceState.byId) {
          continue;
        }
        // for now, both ChainEntity and ChainConfig have somewhat compatible types
        // we just rename the chainId to networkChainId to avoid confusion
        const chain: ChainEntity = {
          ...omit(chainConfig, [
            'chainId',
            'explorerTokenUrlTemplate',
            'explorerAddressUrlTemplate',
            'explorerTxUrlTemplate',
          ]),
          networkChainId: chainConfig.chainId,
          explorerTokenUrlTemplate:
            chainConfig.explorerTokenUrlTemplate || `${chainConfig.explorerUrl}/token/{address}`,
          explorerAddressUrlTemplate:
            chainConfig.explorerAddressUrlTemplate ||
            `${chainConfig.explorerUrl}/address/{address}`,
          explorerTxUrlTemplate:
            chainConfig.explorerTxUrlTemplate || `${chainConfig.explorerUrl}/tx/{hash}`,
        };

        sliceState.byId[chain.id] = chain;
        sliceState.chainIdByNetworkChainId[chain.networkChainId] = chain.id;
        sliceState.allIds.push(chain.id);
        sliceState[chain.eol && timestampNow > chain.eol ? 'eolIds' : 'activeIds'].push(chain.id);
        // If a custom RPC was set in local storage, use that instead of the default
        const rpcs = localRpcs[chain.id] || chain.rpc;
        sliceState.activeRpcsByChainId[chain.id] = {
          hash: djb2Hash(JSON.stringify(rpcs)),
          rpcs,
        };
      }
    });

    builder.addCase(updateActiveRpc, (sliceState, action) => {
      const { chainId, rpcUrl } = action.payload;
      if (!sliceState.activeRpcsByChainId[chainId]) {
        console.warn('Attempting to set an rpc on an unsupported chain');
      }
      const updatedRpc = [rpcUrl];
      sliceState.activeRpcsByChainId[chainId] = {
        hash: djb2Hash(JSON.stringify(updatedRpc)),
        rpcs: updatedRpc,
      };
    });

    builder.addCase(restoreDefaultRpcsOnSingleChain, (sliceState, action) => {
      const { chainId } = action.payload;
      if (!sliceState.byId[chainId]) {
        return console.warn('Attempting to restore default rpcs on an unsupported chain');
      }
      const defaultChainRpc = sliceState.byId[chainId]!.rpc;
      sliceState.activeRpcsByChainId[chainId] = {
        hash: djb2Hash(JSON.stringify(defaultChainRpc)),
        rpcs: defaultChainRpc,
      };
    });
  },
});
