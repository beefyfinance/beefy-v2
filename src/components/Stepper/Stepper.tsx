import type { FC } from 'react';
import React from 'react';
import { makeStyles, Snackbar } from '@material-ui/core';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  selectStepperCurrentStepData,
  selectStepperState,
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
  }, [currentStepData, dispatch, steps.currentStep, steps.modal]);

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
