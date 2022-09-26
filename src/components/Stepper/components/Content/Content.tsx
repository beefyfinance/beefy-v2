import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';
import { selectBridgeStatus } from '../../../../features/data/selectors/bridge';
import {
  selectMintResult,
  selectStepperCurrentStepData,
  selectStepperFinished,
} from '../../../../features/data/selectors/stepper';
import { formatBigDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { Button } from '../../../Button';
import { TransactionLink } from '../TransactionLink';
import { walletActions } from '../../../../features/data/actions/wallet-actions';
import { styles } from './styles';

const useStyles = makeStyles(styles);

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
  const bridgeStatus = useAppSelector(selectBridgeStatus);
  const needShowBridgeInfo = bridgeStatus === 'loading' || bridgeStatus === 'confirming';
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
    dispatch(walletActions.resetWallet());
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
  const bridgeStatus = useAppSelector(selectBridgeStatus);

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
    dispatch(walletActions.resetWallet());
  }, [dispatch]);

  return (
    <>
      {currentStepData.step === 'bridge' ? (
        bridgeStatus === 'success' ? (
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
        rewardToken: currentStepData.extraInfo.rewards.token.symbol,
      })
    : currentStepData.step === 'mint'
    ? t(`${selectMintResult(walletActionsState).type}-Success-Content`, {
        amount: selectMintResult(walletActionsState).amount,
        token: walletActionsState.data.token.symbol,
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
      {currentStepData.step !== 'bridge' && (
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
      )}
    </>
  );
});
