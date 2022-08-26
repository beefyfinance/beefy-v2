import { isEmpty } from 'lodash';
import React from 'react';
import { ChainEntity } from '../../features/data/entities/chain';
import { useAppDispatch, useAppSelector } from '../../store';
import { selectSteperState } from '../../features/data/selectors/stepper';
import { stepperActions } from '../../features/data/reducers/wallet/stepper';

export function useStepper(): [(chainId: ChainEntity['id']) => unknown, boolean] {
  const steps = useAppSelector(selectSteperState);

  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const dispatch = useAppDispatch();

  // advance stepper
  React.useEffect(() => {
    if (!isEmpty(steps.items[steps.currentStep]) && steps.modal) {
      const items = steps.items;
      if (items[steps.currentStep].pending === false) {
        dispatch(stepperActions.updateCurrentStep({ pending: true }));
        dispatch(items[steps.currentStep].action);
      } else {
        if (walletActionsState.result === 'success' && !steps.finished) {
          const nextStep = steps.currentStep + 1;
          if (!isEmpty(items[nextStep])) {
            dispatch(stepperActions.updateCurrentStepIndex({ stepIndex: nextStep }));
          } else {
            dispatch(stepperActions.setFinished({ finished: true }));
          }
        }
      }
    }
  }, [
    dispatch,
    steps.currentStep,
    steps.finished,
    steps.items,
    steps.modal,
    walletActionsState.result,
  ]);

  function startStepper(chainId: ChainEntity['id']) {
    dispatch(stepperActions.setChainId({ chainId }));
    dispatch(stepperActions.updateCurrentStepIndex({ stepIndex: 0 }));
    dispatch(stepperActions.setModal({ modal: true }));
  }

  const isStepping = steps.modal && !steps.finished;

  return [startStepper, isStepping];
}
