import { createSlice } from '@reduxjs/toolkit';
import { fetchChainConfigs } from '../actions/chains';
import type { ChainEntity } from '../entities/chain';
import type { NormalizedEntity } from '../utils/normalized-entity';
import { omit } from 'lodash-es';
import type { Draft } from 'immer';

/**
 * State containing Vault infos
 */
export type ChainsState = NormalizedEntity<ChainEntity> & {
  activeIds: ChainEntity['id'][];
  eolIds: ChainEntity['id'][];
};

export const initialChainsState: ChainsState = {
  byId: {},
  allIds: [],
  activeIds: [],
  eolIds: [],
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

      for (const chainConfig of action.payload.chainConfigs) {
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
        sliceState.allIds.push(chain.id);
        sliceState[chain.eol && timestampNow > chain.eol ? 'eolIds' : 'activeIds'].push(chain.id);
      }
    });
  },
});
