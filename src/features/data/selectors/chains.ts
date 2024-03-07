import { createSelector } from '@reduxjs/toolkit';
import { createCachedSelector } from 're-reselect';
import type { BeefyState } from '../../../redux-types';
import type { ChainEntity } from '../entities/chain';
import { selectChainNativeToken } from './tokens';

function makeChainSelector(idsSelector: (state: BeefyState) => ChainEntity['id'][]) {
  return createSelector(
    idsSelector,
    (state: BeefyState) => state.entities.chains.byId,
    (allIds, byId) => allIds.map(id => byId[id]).filter((c): c is ChainEntity => !!c)
  );
}

export const selectChainById = createCachedSelector(
  (state, chainId) => chainId,
  state => state.entities.chains.byId,
  (chainId, byId): ChainEntity => {
    const chain = byId[chainId];
    if (!chain) throw new Error(`Unknown chainId ${chainId}`);
    return chain;
  }
)((state, chainId) => chainId);

export const selectAllChainsNativeAssetsIsd = (state: BeefyState) => {
  const allChainIds = selectAllChainIds(state);

  const assetdsIds = new Set();
  for (const chainId of allChainIds) {
    const nativeToken = selectChainNativeToken(state, chainId);
    assetdsIds.add(nativeToken.id);
  }

  return assetdsIds;
};

export const selectAllChainIds = (state: BeefyState) => state.entities.chains.allIds;
export const selectActiveChainIds = (state: BeefyState) => state.entities.chains.activeIds;
export const selectEolChainIds = (state: BeefyState) => state.entities.chains.eolIds;

export const selectAllChains = makeChainSelector(selectAllChainIds);
export const selectActiveChains = makeChainSelector(selectActiveChainIds);
export const selectEolChains = makeChainSelector(selectEolChainIds);
