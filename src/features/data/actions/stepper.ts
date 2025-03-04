import { type AnyAction, createAsyncThunk, type ThunkAction } from '@reduxjs/toolkit';
import { isEmpty } from '../../../helpers/utils.ts';
import type { BeefyState } from '../../../redux-types.ts';
import type { ChainEntity } from '../entities/chain.ts';
import type { Step } from '../reducers/wallet/stepper.ts';
import { StepContent, stepperActions } from '../reducers/wallet/stepper.ts';

type StartStepperParams = ChainEntity['id'];

export interface StarStepperPayload {
  chainId: ChainEntity['id'];
  stepIndex: number;
  modal: boolean;
}

export const startStepper = createAsyncThunk<
  StarStepperPayload,
  StartStepperParams,
  {
    state: BeefyState;
  }
>('stepper/startStepper', chainId => {
  return {
    chainId,
    stepIndex: 0,
    modal: true,
  };
});

export const updateSteps = createAsyncThunk<
  void,
  void,
  {
    state: BeefyState;
  }
>('stepper/updateSteps', (_, { getState, dispatch }) => {
  const store = getState();
  const walletActionsState = store.user.walletActions;
  const steps = store.ui.stepperState;
  if (walletActionsState.result === 'success' && steps.stepContent !== StepContent.SuccessTx) {
    const nextStep = steps.currentStep + 1;
    if (!isEmpty(steps.items[nextStep])) {
      dispatch(stepperActions.updateCurrentStepIndex({ stepIndex: nextStep }));
      dispatch(stepperActions.setStepContent({ stepContent: StepContent.StartTx }));
    } else {
      dispatch(stepperActions.setStepContent({ stepContent: StepContent.SuccessTx }));
    }
  }
});

export function startStepperWithSteps(
  steps: Step[],
  chainId: ChainEntity['id']
): ThunkAction<void, BeefyState, unknown, AnyAction> {
  return dispatch => {
    dispatch(stepperActions.reset());
    for (const step of steps) {
      dispatch(stepperActions.addStep({ step }));
    }
    dispatch(startStepper(chainId));
  };
}
