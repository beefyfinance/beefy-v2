import { IconButton, makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { selectBridgeStatus } from '../../../../features/data/selectors/bridge';
import {
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperFinished,
  selectStepperItems,
} from '../../../../features/data/selectors/stepper';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { styles } from './styles';
import React from 'react';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';

const useStyles = makeStyles(styles);

const _Title = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);
  const bridgeStatus = useAppSelector(selectBridgeStatus);
  const needShowBridgeInfo = bridgeStatus === 'loading' || bridgeStatus === 'confirming';
  const stepperItems = useAppSelector(selectStepperItems);
  const currentStep = useAppSelector(selectStepperCurrentStep);
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const stepsFinished = useAppSelector(selectStepperFinished);
  const dispatch = useAppDispatch();
  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>
        {/* Error  */}
        {walletActionsStateResult === 'error' && (
          <>
            <img
              className={classes.icon}
              src={require('../../../../images/icons/error.svg').default}
              alt="error"
            />
            {t('Transactn-Error')}
          </>
        )}
        {/* Waiting  */}
        {((needShowBridgeInfo && walletActionsStateResult !== null) ||
          (!stepsFinished && walletActionsStateResult === 'success_pending')) &&
          t('Transactn-ConfirmPending')}
        {/* Transactions  */}
        {!stepsFinished &&
          walletActionsStateResult !== 'error' &&
          walletActionsStateResult !== 'success_pending' &&
          `${currentStep} / ${stepperItems.length} ${t('Transactn-Confirmed')} `}
        {/* Succes Title */}
        {stepsFinished && (
          <>
            {currentStepData.step !== 'bridge' && t(`${currentStepData.step}-Success-Title`)}
            {currentStepData.step === 'bridge' &&
              bridgeStatus === 'success' &&
              t(`bridge-Success-Title`)}
          </>
        )}
      </div>
      <IconButton className={classes.closeIcon} onClick={handleClose}>
        <CloseRoundedIcon fontSize="small" htmlColor="#8A8EA8" />
      </IconButton>
    </div>
  );
};

export const Title = memo(_Title);
