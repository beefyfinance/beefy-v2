import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';
import {
  selectStepperCurrentStepData,
  selectStepperFinished,
} from '../../../../features/data/selectors/stepper';
import { formatBigDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { Button } from '../../../Button';
import { TransactionLink } from '../TransactionLink';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Content = () => {
  return <div>SuccessContent</div>;
};

export const StepsCountContent = memo(function () {
  const classes = useStyles();
  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const stepsFinished = useAppSelector(selectStepperFinished);

  return (
    <>
      {!isEmpty(currentStepData) &&
        walletActionsStateResult !== 'error' &&
        walletActionsStateResult !== 'success_pending' &&
        !stepsFinished && <div className={classes.message}>{currentStepData.message}</div>}
    </>
  );
});

export const WaitingContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const bridgeModalStatus = useAppSelector(state => state.ui.bridgeModal.status);
  const needShowBridgeInfo = bridgeModalStatus === 'loading' || bridgeModalStatus === 'confirming';
  const walletActionsStateResult = useAppSelector(state => state.user.walletActions.result);
  const stepsFinished = useAppSelector(selectStepperFinished);

  return (
    <>
      {((needShowBridgeInfo && walletActionsStateResult !== null) ||
        (!stepsFinished && walletActionsStateResult === 'success_pending')) && (
        <div className={classes.message}>{t('Transactn-Wait')}</div>
      )}
    </>
  );
});

export const ErrorContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const stepsFinished = useAppSelector(selectStepperFinished);
  const dispatch = useAppDispatch();

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  return (
    <>
      {!stepsFinished && walletActionsState.result === 'error' && (
        <>
          <div className={clsx(classes.content, classes.errorContent)}>
            {walletActionsState.data.error.friendlyMessage ? (
              <div className={classes.friendlyMessage}>
                {walletActionsState.data.error.friendlyMessage}
              </div>
            ) : null}
            <div className={classes.message}>{walletActionsState.data.error.message}</div>
          </div>
          <Button
            borderless={true}
            fullWidth={true}
            className={classes.closeBtn}
            onClick={handleClose}
          >
            {t('Transactn-Close')}
          </Button>
        </>
      )}
    </>
  );
});

export const ButtonsContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const bridgeModalStatus = useAppSelector(state => state.ui.bridgeModal.status);

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  return (
    <>
      {currentStepData.step === 'bridge' ? (
        bridgeModalStatus === 'success' ? (
          <Button
            borderless={true}
            fullWidth={true}
            className={classes.closeBtn}
            onClick={handleClose}
          >
            {t('Transactn-Close')}
          </Button>
        ) : null
      ) : (
        <Button
          borderless={true}
          fullWidth={true}
          className={classes.closeBtn}
          onClick={handleClose}
        >
          {t('Transactn-Close')}
        </Button>
      )}
    </>
  );
});

export const SuccessContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const hasRememberMsg = currentStepData.step === 'deposit' || currentStepData.step === 'stake';
  const rememberMsg =
    currentStepData.step === 'deposit'
      ? 'Remember-Msg'
      : currentStepData.step === 'stake'
      ? 'Remember-Msg-Bst'
      : '';

  const hasRewards = currentStepData.extraInfo?.rewards;

  const isZapOutMessage = currentStepData.extraInfo?.zap && currentStepData.step === 'withdraw';

  const successMessage = hasRewards
    ? t(`${currentStepData.step}-Success-Content`, {
        amount: formatBigDecimals(walletActionsState?.data.amount, 4),
        token: walletActionsState?.data.token.symbol,
        rewards: formatBigDecimals(currentStepData.extraInfo.rewards.amount),
        rewardsToken: currentStepData.extraInfo.rewards.token.symbol,
      })
    : isZapOutMessage
    ? t('withdraw-zapout-Success-Content', {
        amount: formatBigDecimals(walletActionsState?.data.amount, 4),
        token: walletActionsState?.data.token.symbol,
      })
    : t(`${currentStepData.step}-Success-Content`, {
        amount: formatBigDecimals(walletActionsState?.data.amount, 4),
        token: walletActionsState?.data.token.symbol,
      });

  return (
    <>
      <div className={clsx(classes.content, classes.successContent)}>
        <div className={classes.message}>{successMessage}</div>
        <TransactionLink />
      </div>
      <ButtonsContent />
      {hasRememberMsg && (
        <div className={classes.rememberContainer}>
          <div className={classes.message}>
            <span>{t('Remember')}</span> {t(rememberMsg)}
          </div>
        </div>
      )}
    </>
  );
});
