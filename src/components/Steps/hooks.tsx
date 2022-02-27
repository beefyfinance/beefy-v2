import { isEmpty } from 'lodash';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Steps } from '.';
import { VaultEntity } from '../../features/data/entities/vault';
import { BeefyState } from '../../redux-types';
import { StepperState } from './types';

export function useStepper(
  vaultId: VaultEntity['id'],
  onClose: () => unknown
): [(steps: StepperState['items']) => unknown, boolean, React.FC] {
  const [steps, setSteps] = React.useState<StepperState>({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const walletActionsState = useSelector((state: BeefyState) => state.user.walletActions);
  const dispatch = useDispatch();

  const handleClose = React.useCallback(() => {
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
    onClose();
  }, [onClose, setSteps]);

  const Stepper: React.FC = React.useMemo(
    () => () => <Steps vaultId={vaultId} steps={steps} handleClose={handleClose} />,
    [vaultId, steps, handleClose]
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
