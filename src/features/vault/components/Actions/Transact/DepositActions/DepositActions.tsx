import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { TenderlyTransactButton } from '../../../../../../components/Tenderly/Buttons/TenderlyTransactButton.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  transactClearInput,
  transactSetSuccessClosed,
} from '../../../../../data/actions/transact.ts';
import { transactSteps } from '../../../../../data/actions/wallet/transact.ts';
import {
  crossChainFetchRecoveryQuote,
  crossChainRecoverySteps,
} from '../../../../../data/actions/wallet/cross-chain.ts';
import {
  isCowcentratedDepositQuote,
  type TransactOption,
  type TransactQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectIsStepperRecoveryExecution,
  selectIsStepperStepping,
  selectStepperBridgeStatus,
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import {
  selectCrossChainRecoveryQuoteOpId,
  selectCrossChainRecoveryQuoteStatus,
  selectRecoveryOpForCurrentVault,
  selectTransactConfirmNeededWithChanges,
  selectTransactExecuting,
  selectTransactForceSelection,
  selectTransactQuoteStatus,
  selectTransactSelectedChainId,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactSuccessClosed,
  selectTransactVaultHasCrossChainZap,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import {
  ActionConnect,
  ActionConnectSwitch,
  ActionSwitch,
} from '../CommonActions/CommonActions.tsx';
import { ConfirmNotice } from '../ConfirmNotice/ConfirmNotice.tsx';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice.tsx';
import { GlpDepositNotice } from '../GlpNotices/GlpNotices.tsx';
import { MaxNativeNotice } from '../MaxNativeNotice/MaxNativeNotice.tsx';
import { NotEnoughNotice } from '../NotEnoughNotice/NotEnoughNotice.tsx';
import { PriceImpactNotice } from '../PriceImpactNotice/PriceImpactNotice.tsx';
import { VaultFees } from '../VaultFees/VaultFees.tsx';
import { styles } from './styles.ts';
import { getExecutionChainId } from '../../../../../../helpers/transactUtils.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';
import { stepperReset } from '../../../../../data/actions/wallet/stepper.ts';
import { useTransactSelectFlowCta } from '../hooks/useTransactSelectFlowCta.ts';

const useStyles = legacyMakeStyles(styles);

export const DepositActions = memo(function DepositActions() {
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const option = quote ? quote.option : null;
  const stepperContent = useAppSelector(selectStepperStepContent);
  const isRecoveryExecution = useAppSelector(selectIsStepperRecoveryExecution);
  const recoveryOp = useAppSelector(selectRecoveryOpForCurrentVault);
  const successClosed = useAppSelector(selectTransactSuccessClosed);
  const isSuccessTx = stepperContent === StepContent.SuccessTx;

  if (successClosed || isSuccessTx) {
    return <ActionClose />;
  }

  if (stepperContent === StepContent.RecoveryTx || isRecoveryExecution || recoveryOp != null) {
    return <ActionRecoveryDeposit />;
  }

  if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled) {
    if (quoteStatus === TransactStatus.Pending) {
      return <ActionDepositPending />;
    }
    return <ActionDepositSelectFlow />;
  }

  return <ActionDeposit quote={quote} option={option} />;
});

/** Quote is loading — keep deposit disabled */
const ActionDepositPending = memo(function ActionDepositPending() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const selectedChainId = useAppSelector(selectTransactSelectedChainId);
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const hasCrossChainZap = useAppSelector(selectTransactVaultHasCrossChainZap);
  const { t } = useTranslation();
  const classes = useStyles();
  const connectSwitchChainId =
    hasCrossChainZap && forceSelection ? undefined : (selectedChainId ?? vault.chainId);

  return (
    <div className={classes.feesContainer}>
      <ActionConnectSwitch chainId={connectSwitchChainId}>
        <Button variant="cta" disabled={true} fullWidth={true} borderless={true}>
          {t('Transact-Deposit')}
        </Button>
      </ActionConnectSwitch>
      <VaultFees />
    </div>
  );
});

/** No quote yet — CTA opens chain/token select (same as TokenSelectButton) */
const ActionDepositSelectFlow = memo(function ActionDepositSelectFlow() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const selectedChainId = useAppSelector(selectTransactSelectedChainId);
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const classes = useStyles();
  const { ctaLabel, openSelectStep } = useTransactSelectFlowCta();
  const connectSwitchChainId = forceSelection ? undefined : (selectedChainId ?? vault.chainId);

  return (
    <div className={classes.feesContainer}>
      <ActionConnectSwitch chainId={connectSwitchChainId}>
        <Button
          variant="cta"
          fullWidth={true}
          borderless={true}
          disabled={!forceSelection}
          onClick={forceSelection ? openSelectStep : undefined}
        >
          {ctaLabel}
        </Button>
      </ActionConnectSwitch>
      <VaultFees />
    </div>
  );
});

type ActionDepositProps = {
  option: TransactOption;
  quote: TransactQuote;
};
const ActionDeposit = memo(function ActionDeposit({ option, quote }: ActionDepositProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByMaxNative, setIsDisabledByMaxNative] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const confirmNeededWithChanges = useAppSelector(selectTransactConfirmNeededWithChanges);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const isCowDepositQuote = isCowcentratedDepositQuote(quote);
  const executionChainId = useMemo(() => getExecutionChainId(quote), [quote]);

  const effectiveDisabledByConfirm = isDisabledByConfirm && !confirmNeededWithChanges;

  const isDisabled =
    isTxInProgress ||
    isExecuting ||
    isDisabledByPriceImpact ||
    isDisabledByMaxNative ||
    effectiveDisabledByConfirm ||
    isDisabledByGlpLock ||
    isDisabledByNotEnoughInput;

  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ?
        <EmeraldGasNotice />
      : null}
      <GlpDepositNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice
        quote={quote}
        onChange={setIsDisabledByPriceImpact}
        hideCheckbox={isDisabledByNotEnoughInput}
      />
      <MaxNativeNotice quote={quote} onChange={setIsDisabledByMaxNative} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="deposit" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.feesContainer}>
        <ActionConnectSwitch chainId={executionChainId}>
          <Button
            variant="cta"
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleClick}
          >
            {t(
              isMaxAll && !isCowDepositQuote ?
                confirmNeededWithChanges ? 'Transact-ConfirmDepositAll'
                : 'Transact-DepositAll'
              : confirmNeededWithChanges ? 'Transact-ConfirmDeposit'
              : 'Transact-Deposit'
            )}
          </Button>
        </ActionConnectSwitch>
        {import.meta.env.DEV ?
          <TenderlyTransactButton option={option} quote={quote} />
        : null}
        <VaultFees />
      </div>
    </>
  );
});

const ActionRecoveryDeposit = memo(function ActionRecoveryDeposit() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const recoveryOp = useAppSelector(selectRecoveryOpForCurrentVault);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isRecoveryExecution = useAppSelector(selectIsStepperRecoveryExecution);
  const recoveryQuoteStatus = useAppSelector(selectCrossChainRecoveryQuoteStatus);
  const recoveryQuoteOpId = useAppSelector(selectCrossChainRecoveryQuoteOpId);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);

  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const opIdFromOp = bridgeStatus?.opId ?? recoveryOp?.id;
  const opId = opIdFromOp ?? recoveryQuoteOpId;
  const destChainId =
    bridgeStatus?.destChainId ?? recoveryOp?.recovery.destChainId ?? vault?.chainId;
  const isOnCorrectChain = connectedChainId === destChainId;

  const hasValidQuote =
    opId != null && recoveryQuoteOpId === opId && recoveryQuoteStatus === TransactStatus.Fulfilled;

  const needsNewQuote = recoveryOp != null && !isRecoveryExecution && !hasValidQuote;

  const handleFetchQuote = useCallback(() => {
    if (opId) {
      setIsFetchingQuote(true);
      dispatch(crossChainFetchRecoveryQuote({ opId }))
        .unwrap()
        .catch(err => {
          console.error('Failed to fetch recovery quote', err);
          throw err;
        })
        .finally(() => setIsFetchingQuote(false));
    }
  }, [dispatch, opId]);

  const handleFinalise = useCallback(() => {
    if (opId) {
      dispatch(crossChainRecoverySteps(opId, t));
    }
  }, [dispatch, opId, t]);

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
          buttonText={t('Transact-RecoverySwitchChain')}
        />
        <VaultFees />
      </div>
    );
  }

  if (needsNewQuote) {
    return (
      <div className={classes.feesContainer}>
        <Button
          variant="recovery"
          disabled={isTxInProgress || isFetchingQuote || !opId}
          fullWidth={true}
          borderless={true}
          onClick={handleFetchQuote}
        >
          {isFetchingQuote ? t('Transact-FetchingQuote') : t('Transact-FetchNewQuote')}
        </Button>
        <VaultFees />
      </div>
    );
  }

  const canFinalise = hasValidQuote && opId != null;
  const finaliseDisabled = !canFinalise || isTxInProgress || isExecuting;

  return (
    <div className={classes.feesContainer}>
      <Button
        variant="recovery"
        disabled={finaliseDisabled}
        fullWidth={true}
        borderless={true}
        onClick={handleFinalise}
      >
        {t('Transact-FinaliseDeposit')}
      </Button>
      <VaultFees />
    </div>
  );
});

const ActionClose = memo(function ActionClose() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch(transactSetSuccessClosed(false));
    dispatch(transactClearInput());
    dispatch(stepperReset());
  }, [dispatch]);

  return (
    <div className={classes.feesContainer}>
      <Button variant="cta" fullWidth={true} borderless={true} onClick={handleClose}>
        {t('Transactn-Close')}
      </Button>
      <VaultFees />
    </div>
  );
});
