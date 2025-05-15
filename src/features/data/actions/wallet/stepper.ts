import { createAction } from '@reduxjs/toolkit';
import { isEmpty } from '../../../../helpers/utils.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { type Step, StepContent } from '../../reducers/wallet/stepper-types.ts';
import type { BeefyThunk } from '../../store/types.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';

export const stepperReset = createAction('stepper/reset');
export const stepperAddStep = createAction<{ step: Step }>('stepper/addStep');
export const stepperUpdateCurrentStep = createAction<{ pending: boolean }>(
  'stepper/updateCurrentStep'
);
export const stepperUpdateCurrentStepIndex = createAction<{ stepIndex: number }>(
  'stepper/updateCurrentStepIndex'
);
export const stepperSetModel = createAction<{ modal: boolean }>('stepper/setModel');
export const stepperSetChainId = createAction<{ chainId: ChainEntity['id'] }>('stepper/setChainId');
export const stepperSetStepContent = createAction<{ stepContent: StepContent }>(
  'stepper/setStepContent'
);

type StartStepperParams = ChainEntity['id'];

export interface StarStepperPayload {
  chainId: ChainEntity['id'];
  stepIndex: number;
  modal: boolean;
}

export const stepperStart = createAppAsyncThunk<StarStepperPayload, StartStepperParams>(
  'stepper/start',
  chainId => {
    return {
      chainId,
      stepIndex: 0,
      modal: true,
    };
  }
);

export const stepperUpdate = createAppAsyncThunk('stepper/update', (_, { getState, dispatch }) => {
  const store = getState();
  const walletActionsState = store.user.walletActions;
  const steps = store.ui.stepperState;
  if (walletActionsState.result === 'success' && steps.stepContent !== StepContent.SuccessTx) {
    const nextStep = steps.currentStep + 1;
    if (!isEmpty(steps.items[nextStep])) {
      dispatch(stepperUpdateCurrentStepIndex({ stepIndex: nextStep }));
      dispatch(stepperSetStepContent({ stepContent: StepContent.StartTx }));
    } else {
      dispatch(stepperSetStepContent({ stepContent: StepContent.SuccessTx }));
    }
  }
});

export function stepperStartWithSteps(steps: Step[], chainId: ChainEntity['id']): BeefyThunk {
  return dispatch => {
    dispatch(stepperReset());
    for (const step of steps) {
      dispatch(stepperAddStep({ step }));
    }
    dispatch(stepperStart(chainId));
  };
}
