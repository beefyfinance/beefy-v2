import { createAddressChainDataSelector, hasLoaderFulfilledOnce } from '../data-loader-helpers.ts';

export const selectIsBalanceAvailableForChainUser = createAddressChainDataSelector(
  'balance',
  hasLoaderFulfilledOnce
);
