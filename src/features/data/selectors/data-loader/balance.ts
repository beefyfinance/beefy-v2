import {
  createAddressChainDataSelector,
  hasLoaderFulfilledOnce,
  hasLoaderSettledOnce,
} from '../data-loader-helpers.ts';

export const selectIsBalanceAvailableForChainUser = createAddressChainDataSelector(
  'balance',
  hasLoaderFulfilledOnce
);

export const selectHasBalanceSettledForChainUser = createAddressChainDataSelector(
  'balance',
  hasLoaderSettledOnce
);
