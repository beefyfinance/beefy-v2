import React, { FC } from 'react';
import { makeStyles, Snackbar } from '@material-ui/core';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../store';
import { BridgeContent } from './components/BridgeContent';
import {
  selectStepperState,
  selectStepperCurrentStepData,
  selectStepperStepContent,
} from '../../features/data/selectors/stepper';
import { StepContent, stepperActions } from '../../features/data/reducers/wallet/stepper';
import {
  ErrorContent,
  StepsCountContent,
  SuccessContent,
  WaitingContent,
} from './components/Content';
import { ProgressBar } from './components/PogressBar';

const stepToComponent: Record<StepContent, FC> = {
  [StepContent.StartTx]: StepsCountContent,
  [StepContent.WaitingTx]: WaitingContent,
  [StepContent.BridgeTx]: BridgeContent,
  [StepContent.ErrorTx]: ErrorContent,
  [StepContent.SuccessTx]: SuccessContent,
};

const useStyles = makeStyles(styles);

const _Stepper = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const content = useAppSelector(selectStepperStepContent);
  const StepContent = stepToComponent[content];

  const steps = useAppSelector(selectStepperState);

  React.useEffect(() => {
    if (!isEmpty(currentStepData) && steps.modal && currentStepData.pending === false) {
      dispatch(stepperActions.updateCurrentStep({ pending: true }));
      dispatch(currentStepData.action);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, steps.currentStep]);

  return (
    <Snackbar
      open={steps.modal}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      autoHideDuration={6000}
      className={classes.snackbar}
    >
      <div className={classes.snackbarContainer}>
        <ProgressBar />
        <div className={classes.contentContainer}>
          <StepContent />
        </div>
      </div>
    </Snackbar>
  );
};

export const Stepper = React.memo(_Stepper);
