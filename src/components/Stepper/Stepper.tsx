import React from 'react';
import { Box, IconButton, makeStyles, Snackbar } from '@material-ui/core';
import { isEmpty } from '../../helpers/utils';
import { styles } from './styles';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../store';
import { BridgeInfo } from './components/BridgeInfo';
import {
  selectSteperState,
  selectStepperCurrentStepData,
  selectStepperFinished,
  selectStepperItems,
} from '../../features/data/selectors/stepper';
import { stepperActions } from '../../features/data/reducers/wallet/stepper';
import { Title } from './components/Title';
import {
  ErrorContent,
  StepsCountContent,
  SuccessContent,
  WaitingContent,
} from './components/Content';

const useStyles = makeStyles(styles);

const _Stepper = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);
  const bridgeModalStatus = useAppSelector(state => state.ui.bridgeModal.status);
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const stepperItems = useAppSelector(selectStepperItems);
  const stepperFinished = useAppSelector(selectStepperFinished);
  const steps = useAppSelector(selectSteperState);

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  React.useEffect(() => {
    if (!isEmpty(currentStepData) && steps.modal && currentStepData.pending === false) {
      dispatch(stepperActions.updateCurrentStep({ pending: true }));
      dispatch(currentStepData.action);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, steps.currentStep]);

  const showProgressbar25 = React.useMemo(() => {
    return (
      (stepperItems[0]?.step === 'approve' && walletActionsStateResult === null) ||
      (stepperItems[0]?.step === 'bridge' && bridgeModalStatus === 'idle')
    );
  }, [bridgeModalStatus, stepperItems, walletActionsStateResult]);

  const showProgressbar50 = React.useMemo(() => {
    return (
      bridgeModalStatus === 'loading' ||
      (currentStepData?.step !== 'approve' &&
        currentStepData?.step !== 'bridge' &&
        walletActionsStateResult === null) ||
      (stepperItems[0]?.step === 'approve' && walletActionsStateResult === 'success_pending')
    );
  }, [bridgeModalStatus, currentStepData?.step, stepperItems, walletActionsStateResult]);

  const showProgressbar75 = React.useMemo(() => {
    return (
      bridgeModalStatus === 'confirming' ||
      (walletActionsStateResult === 'success_pending' &&
        currentStepData?.step !== 'bridge' &&
        currentStepData?.step !== 'approve')
    );
  }, [bridgeModalStatus, currentStepData?.step, walletActionsStateResult]);

  const showSuccesBar = React.useMemo(() => {
    return (
      bridgeModalStatus === 'success' || (stepperFinished && currentStepData?.step !== 'bridge')
    );
  }, [bridgeModalStatus, currentStepData?.step, stepperFinished]);

  return (
    <Snackbar
      key={steps.currentStep}
      open={steps.modal}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      autoHideDuration={6000}
      className={classes.snackbar}
    >
      <Box className={classes.snackbarContainer}>
        <Box className={classes.topBar}>
          <Box
            className={clsx({
              [classes.errorBar]: walletActionsStateResult === 'error',
              [classes.successBar]: showSuccesBar,
              [classes.progressBar75]: showProgressbar75,
              [classes.progressBar50]: showProgressbar50,
              [classes.progressBar25]: showProgressbar25,
            })}
          />
        </Box>
        <Box className={classes.contentContainer}>
          <Box className={classes.titleContainer}>
            <Title />
            <IconButton className={classes.closeIcon} onClick={handleClose}>
              <CloseRoundedIcon fontSize="small" htmlColor="#8A8EA8" />
            </IconButton>
          </Box>
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
        </Box>
      </Box>
    </Snackbar>
  );
};

export const Stepper = React.memo(_Stepper);
