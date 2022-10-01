import React from 'react';
import { makeStyles, Snackbar } from '@material-ui/core';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../store';
import { BridgeInfo } from './components/BridgeInfo';
import {
  selectSteperState,
  selectStepperCurrentStepData,
  selectStepperFinished,
} from '../../features/data/selectors/stepper';
import { stepperActions } from '../../features/data/reducers/wallet/stepper';
import { Title } from './components/Title';
import {
  ErrorContent,
  StepsCountContent,
  SuccessContent,
  WaitingContent,
} from './components/Content';
import { ProgressBar } from './components/PogressBar';

const useStyles = makeStyles(styles);

const _Stepper = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);

  const stepperFinished = useAppSelector(selectStepperFinished);
  const steps = useAppSelector(selectSteperState);

  React.useEffect(() => {
    if (!isEmpty(currentStepData) && steps.modal && currentStepData.pending === false) {
      dispatch(stepperActions.updateCurrentStep({ pending: true }));
      dispatch(currentStepData.action);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, steps.currentStep]);

  return (
    <Snackbar
      key={steps.currentStep}
      open={steps.modal}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      autoHideDuration={6000}
      className={classes.snackbar}
    >
      <div className={classes.snackbarContainer}>
        <ProgressBar />
        <div className={classes.contentContainer}>
          {/*Title */}
          <Title />
          {/* Steps Count Content */}
          <StepsCountContent />
          {/* Waiting Content */}
          <WaitingContent />
          {/* Error content */}
          <ErrorContent />
          {/*Bridge Info */}
          <BridgeInfo />
          {/* Steps finished */}
          {stepperFinished && <SuccessContent />}
        </div>
      </div>
    </Snackbar>
  );
};

export const Stepper = React.memo(_Stepper);
