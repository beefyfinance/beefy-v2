import { makeStyles } from '@material-ui/core';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperFinished,
  selectStepperItems,
} from '../../../../features/data/selectors/stepper';
import { useAppSelector } from '../../../../store';
import { styles } from './styles';

const useStyles = makeStyles(styles);

const _Title = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);

  const bridgeModalStatus = useAppSelector(state => state.ui.bridgeModal.status);

  const needShowBridgeInfo = bridgeModalStatus === 'loading' || bridgeModalStatus === 'confirming';

  const stepperItems = useAppSelector(selectStepperItems);

  const currentStep = useAppSelector(selectStepperCurrentStep);

  const currentStepData = useAppSelector(selectStepperCurrentStepData);

  const stepsFinished = useAppSelector(selectStepperFinished);

  return (
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
            bridgeModalStatus === 'success' &&
            t(`bridge-Success-Title`)}
        </>
      )}
    </div>
  );
};

export const Title = memo(_Title);
