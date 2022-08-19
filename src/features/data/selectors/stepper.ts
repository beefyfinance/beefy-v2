import { BeefyState } from '../../../redux-types';

export const selectSteperState = (state: BeefyState) => {
  return state.ui.stepperState;
};

export const selectSteperChainId = (state: BeefyState) => {
  return state.ui.stepperState.chainId;
};
