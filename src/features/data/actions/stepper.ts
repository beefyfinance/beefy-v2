import { createAsyncThunk } from '@reduxjs/toolkit';
import { isEmpty } from '../../../helpers/utils';
import { BeefyState } from '../../../redux-types';
import { ChainEntity } from '../entities/chain';
import { stepperActions } from '../reducers/wallet/stepper';

type StartStepperParams = ChainEntity['id'];

export interface StarStepperPayload {
  chainId: ChainEntity['id'];
  stepIndex: number;
  modal: boolean;
}

export const startStepper = createAsyncThunk<
  StarStepperPayload,
  StartStepperParams,
  { state: BeefyState }
>('stepper/startStepper', chainId => {
  return {
    chainId,
    stepIndex: 0,
    modal: true,
  };
});

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
