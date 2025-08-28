import {
  createChainDataSelector,
  createGlobalDataSelector,
  hasLoaderFulfilledOnce,
  shouldLoaderLoadOnce,
} from '../data-loader-helpers.ts';
import type { BeefyState } from '../../store/types.ts';
import type { ChainEntity } from '../../entities/chain.ts';

const selectShouldInitAddressBookGlobal = createGlobalDataSelector(
  'addressBook',
  shouldLoaderLoadOnce
);
export const selectIsAddressBookLoadedGlobal = createGlobalDataSelector(
  'addressBook',
  hasLoaderFulfilledOnce
);
const selectShouldInitAddressBookChain = createChainDataSelector(
  'addressBook',
  shouldLoaderLoadOnce
);
const selectIsAddressBookLoadedChain = createChainDataSelector(
  'addressBook',
  hasLoaderFulfilledOnce
);
export const selectShouldInitAddressBook = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectShouldInitAddressBookGlobal(state) || selectShouldInitAddressBookChain(state, chainId);
export const selectIsAddressBookLoaded = (state: BeefyState, chainId: ChainEntity['id']) =>
  selectIsAddressBookLoadedGlobal(state) || selectIsAddressBookLoadedChain(state, chainId);
