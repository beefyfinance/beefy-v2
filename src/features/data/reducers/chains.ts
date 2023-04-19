import { createSlice } from '@reduxjs/toolkit';
import { fetchChainConfigs } from '../actions/chains';
import { ChainEntity } from '../entities/chain';
import { NormalizedEntity } from '../utils/normalized-entity';

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
    builder.addCase(fetchChainConfigs.fulfilled, (sliceState, action) => {
      const timestampNow = Date.now() / 1000;

      for (const chainConfig of action.payload.chainConfigs) {
        // we already know this chain
        if (chainConfig.id in sliceState.byId) {
          continue;
        }
        // for now, both ChainEntity and ChainConfig have somewhat compatible types
        // we just rename the chainId to networkChainId to avoid confusion
        const { chainId: _, ...chainConfigData } = chainConfig;
        const chain: ChainEntity = {
          ...chainConfigData,
          networkChainId: chainConfig.chainId,
        };

        sliceState.byId[chain.id] = chain;
        sliceState.allIds.push(chain.id);
        sliceState[chain.eol && timestampNow > chain.eol ? 'eolIds' : 'activeIds'].push(chain.id);
      }
    });
  },
});
