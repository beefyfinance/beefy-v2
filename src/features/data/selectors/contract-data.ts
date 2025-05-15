import { createChainDataSelector, hasLoaderFulfilledOnce } from './data-loader-helpers.ts';

export const selectIsContractDataLoadedOnChain = createChainDataSelector(
  'contractData',
  hasLoaderFulfilledOnce
);
