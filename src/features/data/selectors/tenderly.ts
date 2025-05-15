import type { TenderlyState } from '../reducers/tenderly-types.ts';
import type { BeefyState } from '../store/types.ts';

const withTenderly = <T>(
  state: BeefyState,
  callback: (tenderly: TenderlyState, state: BeefyState) => T
) => {
  const slice = state.ui.tenderly;
  if (!slice) {
    throw new Error('Tenderly is only available on DEV');
  }
  return callback(slice, state);
};

export const selectTenderlyMode = (state: BeefyState) =>
  withTenderly(state, tenderly => tenderly.mode);

export const selectTenderlyStatus = (state: BeefyState) =>
  withTenderly(state, tenderly => tenderly.status);

export const selectTenderlyErrorOrUndefined = (state: BeefyState) =>
  withTenderly(state, tenderly => tenderly.error);

export const selectTenderlyCredentialsOrUndefined = (state: BeefyState) =>
  withTenderly(state, tenderly => tenderly.credentials || undefined);

export const selectTenderlyRequestOrUndefined = (state: BeefyState) =>
  withTenderly(state, tenderly => tenderly.request);

export const selectTenderlyResultOrUndefined = (state: BeefyState) =>
  withTenderly(state, tenderly => tenderly.result);
