import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React, { memo, useMemo } from 'react';
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
      <Title text={t('Transactn-Confirmed', { currentStep, totalTxs: stepperItems.length })} />
      <div className={classes.message}>{currentStepData?.message}</div>
    </>
  );
});

export const WaitingContent = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Title text={t('Transactn-ConfirmPending')} />
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
      <Title
        text={
          <>
            <img
              className={classes.icon}
              src={require('../../../../images/icons/error.svg').default}
              alt="error"
            />
            {t('Transactn-Error')}
          </>
        }
      />

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
  const rememberMsg = useMemo(() => {
    if (currentStepData.step === 'deposit') {
      return 'Remember-Msg';
    }
    if (currentStepData.step === 'stake') {
      return 'Remember-Msg-Bst';
    }
    return '';
  }, [currentStepData.step]);

  const textParams = useMemo(() => {
    if (currentStepData.extraInfo?.rewards) {
      return {
        amount: formatBigDecimals(walletActionsState?.data.amount, 4),
        token: walletActionsState?.data.token.symbol,
        rewards: formatBigDecimals(currentStepData.extraInfo.rewards.amount),
        rewardToken: currentStepData.extraInfo.rewards.token.symbol,
      };
    }
    return {
      amount: selectMintResult(walletActionsState).amount,
      token: walletActionsState.data.token.symbol,
    };
  }, [currentStepData.extraInfo?.rewards, walletActionsState]);

  const isZapOutMessage = currentStepData.extraInfo?.zap && currentStepData.step === 'withdraw';

  const successMessage = useMemo(() => {
    if (currentStepData.step === 'mint')
      t(`${selectMintResult(walletActionsState).type}-Success-Content`, { ...textParams });

    if (isZapOutMessage) t('withdraw-zapout-Success-Content', { ...textParams });

    return t(`${currentStepData.step}-Success-Content`, { ...textParams });
  }, [currentStepData.step, isZapOutMessage, t, textParams, walletActionsState]);

  return (
    <>
      <Title text={t(`${currentStepData.step}-Success-Title`)} />
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
