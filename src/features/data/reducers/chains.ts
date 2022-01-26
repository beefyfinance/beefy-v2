import { createSlice } from '@reduxjs/toolkit';
import { fetchChainConfigs } from '../actions/chains';
import { ChainEntity } from '../entities/chain';
import { NormalizedEntity } from '../utils/normalized-entity';

/**
 * State containing Vault infos
 */
export type ChainsState = NormalizedEntity<ChainEntity>;
export const initialChainsState: ChainsState = {
  byId: {},
  allIds: [],
};

export const chainsSlice = createSlice({
  name: 'chains',
  initialState: initialChainsState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
  },
  extraReducers: builder => {
    builder.addCase(fetchChainConfigs.fulfilled, (sliceState, action) => {
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
      }
    });
  },
});
