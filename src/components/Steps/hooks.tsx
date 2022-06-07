import { isEmpty } from 'lodash';
import React from 'react';
import { Steps } from '.';
import { ChainEntity } from '../../features/data/entities/chain';
import { StepperState } from './types';
import { useAppDispatch, useAppSelector } from '../../store';

export function useStepper(
  chainId: ChainEntity['id'],
  onClose?: () => unknown
): [(steps: StepperState['items']) => unknown, boolean, React.FC] {
  const [steps, setSteps] = React.useState<StepperState>({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });

  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const dispatch = useAppDispatch();

  const handleClose = React.useCallback(() => {
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
    if (onClose) {
      onClose();
    }
  }, [onClose, setSteps]);

  const Stepper: React.FC = React.useMemo(
    () => React.memo(() => <Steps chainId={chainId} steps={steps} handleClose={handleClose} />),
    [chainId, steps, handleClose]
  );

  // advance stepper
  React.useEffect(() => {
    const index = steps.currentStep;
    if (!isEmpty(steps.items[index]) && steps.modal) {
      const items = steps.items;
      if (!items[index].pending) {
        items[index].pending = true;
        dispatch(items[index].action);
        setSteps({ ...steps, items: items });
      } else {
        if (walletActionsState.result === 'success' && !steps.finished) {
          const nextStep = index + 1;
          if (!isEmpty(items[nextStep])) {
            setSteps({ ...steps, currentStep: nextStep });
          } else {
            setSteps({ ...steps, finished: true });
          }
        }
      }
    }
  }, [dispatch, steps, walletActionsState]);

  function startStepper(steps: StepperState['items']) {
    setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
  }

  const isStepping = steps.modal && !steps.finished;

  return [startStepper, isStepping, Stepper];
}
