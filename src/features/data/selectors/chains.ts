import { createSelector } from '@reduxjs/toolkit';
import type { ChainEntity, ChainId } from '../entities/chain.ts';
import type { BeefyState } from '../store/types.ts';

function makeChainSelector(idsSelector: (state: BeefyState) => ChainEntity['id'][]) {
  return createSelector(
    idsSelector,
    (state: BeefyState) => state.entities.chains.byId,
    (allIds, byId) => allIds.map(id => byId[id]).filter((c): c is ChainEntity => !!c)
  ) as (state: BeefyState) => ChainEntity[];
}

export const selectChainById = (state: BeefyState, chainId: ChainEntity['id']): ChainEntity => {
  const chain = state.entities.chains.byId[chainId];
  if (!chain) {
    throw new Error(`Unknown chainId ${chainId}`);
  }
  return chain;
};

export const selectChainByIdOrUndefined = (state: BeefyState, chainId: ChainEntity['id']) =>
  state.entities.chains.byId[chainId] || undefined;

export const selectChainByNetworkChainId = (
  state: BeefyState,
  networkChainId: number
): ChainEntity | undefined => {
  const chainId = state.entities.chains.chainIdByNetworkChainId[networkChainId];
  return chainId ? selectChainById(state, chainId) : undefined;
};

export const selectAllChainIds = (state: BeefyState) => state.entities.chains.allIds;
export const selectActiveChainIds = (state: BeefyState) => state.entities.chains.activeIds;
export const selectActiveRpcUrlForChain = (state: BeefyState, chainId: ChainId) => {
  const activeRpcsForChain = state.entities.chains.activeRpcsByChainId[chainId];
  if (!activeRpcsForChain) {
    throw new Error(`No active RPCs found for chainId: ${chainId}`);
  }
  return activeRpcsForChain.rpcs;
};

export const selectChainHasModifiedRpc = (state: BeefyState, chainId: ChainId) => {
  const activeRpcUrl = selectActiveRpcUrlForChain(state, chainId);
  const defaultRpc = selectChainById(state, chainId).rpc;
  return (
    activeRpcUrl.length !== defaultRpc.length ||
    activeRpcUrl.some((url, index) => url !== defaultRpc[index])
  );
};

export const selectAllChains = makeChainSelector(selectAllChainIds);
export const selectActiveChains = makeChainSelector(selectActiveChainIds);
