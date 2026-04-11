import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedButton } from '../../../../../../components/Button/AnimatedButton.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  crossChainFetchRecoveryQuote,
  crossChainRecoverySteps,
} from '../../../../../data/actions/wallet/cross-chain.ts';
import { stepperReset } from '../../../../../data/actions/wallet/stepper.ts';
import {
  transactClearInput,
  transactSetSuccessClosed,
} from '../../../../../data/actions/transact.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectIsStepperStepping,
  selectStepperBridgeStatus,
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import {
  selectCrossChainRecoveryQuoteOpId,
  selectCrossChainRecoveryQuoteStatus,
  selectRecoveryOpForCurrentVault,
  selectTransactExecuting,
  selectTransactSuccessClosed,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import { ActionConnect, ActionSwitch } from './CommonActions.tsx';
import { VaultFees } from '../VaultFees/VaultFees.tsx';
import { styles } from '../DepositActions/styles.ts';

const useStyles = legacyMakeStyles(styles);

type ActionRecoveryProps = {
  mode: 'deposit' | 'withdraw';
};

export const ActionRecovery = memo(function ActionRecovery({ mode }: ActionRecoveryProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const recoveryOp = useAppSelector(selectRecoveryOpForCurrentVault);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const stepperContent = useAppSelector(selectStepperStepContent);
  const recoveryQuoteStatus = useAppSelector(selectCrossChainRecoveryQuoteStatus);
  const recoveryQuoteOpId = useAppSelector(selectCrossChainRecoveryQuoteOpId);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const successClosed = useAppSelector(selectTransactSuccessClosed);

  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const isSuccessTx = stepperContent === StepContent.SuccessTx;
  const isComplete = successClosed || isSuccessTx;
  const isStepperError = stepperContent === StepContent.ErrorTx;

  const opIdFromOp = bridgeStatus?.opId ?? recoveryOp?.id;
  const opId = opIdFromOp ?? recoveryQuoteOpId;
  const destChainId =
    bridgeStatus?.destChainId ?? recoveryOp?.recovery.destChainId ?? vault?.chainId;
  const isOnCorrectChain = connectedChainId === destChainId;
  const isFetchingQuote = recoveryQuoteStatus === TransactStatus.Pending;

  const hasValidQuote =
    opId != null && recoveryQuoteOpId === opId && recoveryQuoteStatus === TransactStatus.Fulfilled;

  // A recovery tx is considered "in flight" while the stepper is actively
  // running it. ErrorTx is explicitly excluded so the form CTA stays usable
  // alongside the stepper's retry button after a failed attempt.
  const isRecoveryInFlight = isTxInProgress && !isStepperError;
  const needsNewQuote = recoveryOp != null && !isRecoveryInFlight && !hasValidQuote;

  const isUnknownFailure =
    bridgeStatus?.lifecycleState === 'abandoned' &&
    (bridgeStatus.dstRefundedAmount == null || bridgeStatus.dstRefundedAmount === '0');

  const typeNoun = mode === 'deposit' ? t('Deposit-noun') : t('Withdraw-noun');

  const handleFetchQuote = useCallback(() => {
    if (opId) {
      dispatch(crossChainFetchRecoveryQuote({ opId }));
    }
  }, [dispatch, opId]);

  const handleFinalise = useCallback(() => {
    if (opId) {
      dispatch(crossChainRecoverySteps(opId, t));
    }
  }, [dispatch, opId, t]);

  const handleClose = useCallback(() => {
    dispatch(transactSetSuccessClosed(false));
    dispatch(transactClearInput());
    dispatch(stepperReset());
  }, [dispatch]);

  // After a successful recovery the stepper transitions to SuccessTx but
  // isRecoveryExecution stays true until stepperReset, which keeps this
  // component mounted. Short-circuit to a Close + success animation so the
  // form matches the stepper's success state.
  if (isComplete) {
    return (
      <div className={classes.feesContainer}>
        <AnimatedButton
          variant="cta"
          isConfirmed={true}
          fullWidth={true}
          borderless={true}
          onClick={handleClose}
        >
          {t('Transactn-Close')}
        </AnimatedButton>
        <VaultFees />
      </div>
    );
  }

  if (isUnknownFailure) {
    return (
      <div className={classes.feesContainer}>
        <AnimatedButton
          loading={true}
          variant="recovery"
          disabled={true}
          fullWidth={true}
          borderless={true}
        >
          {mode === 'deposit' ? t('Transact-DepositInProgress') : t('Transact-WithdrawInProgress')}
        </AnimatedButton>
        <VaultFees />
      </div>
    );
  }

  if (!isWalletConnected) {
    return (
      <div className={classes.feesContainer}>
        <ActionConnect />
        <VaultFees />
      </div>
    );
  }

  if (!isOnCorrectChain) {
    return (
      <div className={classes.feesContainer}>
        <ActionSwitch
          chainId={destChainId}
          variant="recovery"
          borderless={true}
          buttonText={t('Transact-RecoverySwitchChainType', { type: typeNoun })}
        />
        <VaultFees />
      </div>
    );
  }

  if (needsNewQuote) {
    return (
      <div className={classes.feesContainer}>
        <AnimatedButton
          needFire={true}
          variant="recovery"
          disabled={isRecoveryInFlight || isFetchingQuote || !opId}
          fullWidth={true}
          borderless={true}
          onClick={handleFetchQuote}
        >
          {isFetchingQuote ? t('Transact-FetchingQuote') : t('Transact-FetchNewQuote')}
        </AnimatedButton>
        <VaultFees />
      </div>
    );
  }

  const canFinalise = hasValidQuote && opId != null;
  const finaliseDisabled = !canFinalise || isRecoveryInFlight || isExecuting;

  return (
    <div className={classes.feesContainer}>
      <AnimatedButton
        needFire={true}
        variant="recovery"
        disabled={finaliseDisabled}
        fullWidth={true}
        borderless={true}
        onClick={handleFinalise}
      >
        {t('Transact-Finalise', { type: typeNoun })}
      </AnimatedButton>
      <VaultFees />
    </div>
  );
});
