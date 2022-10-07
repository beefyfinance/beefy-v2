import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';
import {
  selectMintResult,
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperItems,
} from '../../../../features/data/selectors/stepper';
import { formatBigDecimals } from '../../../../helpers/format';

import { useAppDispatch, useAppSelector } from '../../../../store';
import { Button } from '../../../Button';
import { TransactionLink } from '../TransactionLink';
import { walletActions } from '../../../../features/data/actions/wallet-actions';
import { styles } from './styles';
import { Title } from '../Title';

const useStyles = makeStyles(styles);

export const StepsCountContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const currentStep = useAppSelector(selectStepperCurrentStep);
  const stepperItems = useAppSelector(selectStepperItems);

  return (
    <>
      <Title>{t('Transactn-Confirmed', { currentStep, totalTxs: stepperItems.length })}</Title>
      <div className={classes.message}>{currentStepData.message}</div>
    </>
  );
});

export const WaitingContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Title>{t('Transactn-ConfirmPending')}</Title>
      <div className={classes.message}>{t('Transactn-Wait')}</div>
    </>
  );
});

export const ErrorContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const walletActionsState = useAppSelector(state => state.user.walletActions);

  return (
    <>
      <Title>
        <img
          className={classes.icon}
          src={require('../../../../images/icons/error.svg').default}
          alt="error"
        />
        {t('Transactn-Error')}
      </Title>
      <div className={clsx(classes.content, classes.errorContent)}>
        {walletActionsState.data.error.friendlyMessage && (
          <div className={classes.friendlyMessage}>
            {walletActionsState.data.error.friendlyMessage}
          </div>
        )}
        <div className={classes.message}>{walletActionsState.data.error.message}</div>
      </div>
      <CloseButton />
    </>
  );
});

export const CloseButton = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
    dispatch(walletActions.resetWallet());
  }, [dispatch]);

  return (
    <Button borderless={true} fullWidth={true} className={classes.closeBtn} onClick={handleClose}>
      {t('Transactn-Close')}
    </Button>
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

  const textParams = currentStepData.extraInfo?.rewards
    ? {
        amount: formatBigDecimals(walletActionsState?.data.amount, 4),
        token: walletActionsState?.data.token.symbol,
        rewards: formatBigDecimals(currentStepData.extraInfo.rewards.amount),
        rewardToken: currentStepData.extraInfo.rewards.token.symbol,
      }
    : {
        amount: selectMintResult(walletActionsState).amount,
        token: walletActionsState.data.token.symbol,
      };

  const isZapOutMessage = currentStepData.extraInfo?.zap && currentStepData.step === 'withdraw';

  const successMessage =
    currentStepData.step === 'mint'
      ? t(`${selectMintResult(walletActionsState).type}-Success-Content`, { ...textParams })
      : isZapOutMessage
      ? t('withdraw-zapout-Success-Content', { ...textParams })
      : t(`${currentStepData.step}-Success-Content`, { ...textParams });

  return (
    <>
      <Title>{t(`${currentStepData.step}-Success-Title`)}</Title>
      <div className={clsx(classes.content, classes.successContent)}>
        <div className={classes.message}>{successMessage}</div>
        <TransactionLink />
      </div>
      {hasRememberMsg && (
        <div className={classes.rememberContainer}>
          <div className={classes.message}>
            <span>{t('Remember')}</span> {t(rememberMsg)}
          </div>
        </div>
      )}
      <CloseButton />
    </>
  );
});
