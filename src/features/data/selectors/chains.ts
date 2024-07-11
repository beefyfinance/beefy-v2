import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';

function makeChainSelector(idsSelector: (state: BeefyState) => ChainEntity['id'][]) {
  return createSelector(
    idsSelector,
    (state: BeefyState) => state.entities.chains.byId,
    (allIds, byId) => allIds.map(id => byId[id]).filter((c): c is ChainEntity => !!c)
  );
}

export const selectChainById = createCachedSelector(
  (_: BeefyState, chainId: ChainEntity['id']) => chainId,
  state => state.entities.chains.byId,
  (chainId, byId): ChainEntity => {
    const chain = byId[chainId];
    if (!chain) throw new Error(`Unknown chainId ${chainId}`);
    return chain;
  }
)((_, chainId) => chainId);

export const selectChainByNetworkChainId = (
  state: BeefyState,
  networkChainId: number
): ChainEntity | undefined => {
  const chainId = state.entities.chains.chainIdByNetworkChainId[networkChainId];
  return chainId ? selectChainById(state, chainId) : undefined;
};

export const selectAllChainIds = (state: BeefyState) => state.entities.chains.allIds;
export const selectActiveChainIds = (state: BeefyState) => state.entities.chains.activeIds;
export const selectEolChainIds = (state: BeefyState) => state.entities.chains.eolIds;

export const selectAllChains = makeChainSelector(selectAllChainIds);
export const selectActiveChains = makeChainSelector(selectActiveChainIds);
export const selectEolChains = makeChainSelector(selectEolChainIds);
