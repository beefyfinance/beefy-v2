import { createSlice } from '@reduxjs/toolkit';
import { chain } from 'lodash';
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
    builder.addCase(fetchChainConfigs.fulfilled, (state, action) => {
      for (const chainConfig of action.payload.chainConfigs) {
        const chainId = chainConfig.id;
        // we already know this chain
        if (chainConfig.id in state.byId) {
          continue;
        }
        // for now, both ChainEntity and ChainConfig have compatible types
        const chain: ChainEntity = chainConfig;

        state.byId[chain.id] = chain;
        state.allIds.push(chain.id);
      }
    });
  },
});
