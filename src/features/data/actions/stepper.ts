import { createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from '../../../helpers/utils';
import { BeefyState, BeefyStore } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { stepperActions } from '../reducers/wallet/stepper';

export async function startStepper(store: BeefyStore, chainId: ChainEntity['id']) {
  store.dispatch(stepperActions.setChainId({ chainId }));
  store.dispatch(stepperActions.updateCurrentStepIndex({ stepIndex: 0 }));
  store.dispatch(stepperActions.setModal({ modal: true }));
}

export const updateSteps = createAsyncThunk<void, void, { state: BeefyState }>(
  'stepper/updateSteps',
  (_, { getState, dispatch }) => {
    const store = getState();
    const walletActionsState = store.user.walletActions;
    const steps = store.ui.stepperState;
    if (walletActionsState.result === 'success' && !steps.finished) {
      const nextStep = steps.currentStep + 1;
      if (!isEmpty(steps.items[nextStep])) {
        dispatch(stepperActions.updateCurrentStepIndex({ stepIndex: nextStep }));
      } else {
        dispatch(stepperActions.setFinished({ finished: true }));
      }
    }
  }
);
