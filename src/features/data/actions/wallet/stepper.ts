import { createAction } from '@reduxjs/toolkit';
import { isEmpty } from '../../../../helpers/utils.ts';
import type { ChainEntity } from '../../entities/chain.ts';
import { type BridgeStatus, type Step, StepContent } from '../../reducers/wallet/stepper-types.ts';
import type { BeefyThunk } from '../../store/types.ts';
import { createAppAsyncThunk } from '../../utils/store-utils.ts';
import { pollCCTPBridgeStatus } from '../cctp.ts';

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
export const stepperSetBridgeStatus =
  createAction<Partial<BridgeStatus>>('stepper/setBridgeStatus');

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
  if (
    walletActionsState.result === 'success' &&
    steps.stepContent !== StepContent.SuccessTx &&
    steps.stepContent !== StepContent.BridgingTx
  ) {
    const nextStep = steps.currentStep + 1;
    if (!isEmpty(steps.items[nextStep])) {
      dispatch(stepperUpdateCurrentStepIndex({ stepIndex: nextStep }));
      dispatch(stepperSetStepContent({ stepContent: StepContent.StartTx }));
    } else {
      const currentItem = steps.items[steps.currentStep];
      const crossChain = currentItem?.extraInfo?.crossChain;

      if (crossChain && walletActionsState.data?.receipt?.transactionHash) {
        const srcTxHash = walletActionsState.data.receipt.transactionHash;
        dispatch(
          stepperSetBridgeStatus({
            srcChainId: crossChain.sourceChainId,
            srcTxHash,
            destChainId: crossChain.destChainId,
            vaultId: currentItem.extraInfo?.vaultId,
          })
        );
        dispatch(stepperSetStepContent({ stepContent: StepContent.BridgingTx }));

        dispatch(pollCCTPBridgeStatus({ srcChainId: crossChain.sourceChainId, txHash: srcTxHash }));
      } else {
        dispatch(stepperSetStepContent({ stepContent: StepContent.SuccessTx }));
      }
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
