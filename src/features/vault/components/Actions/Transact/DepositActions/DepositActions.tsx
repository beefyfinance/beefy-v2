import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedButton } from '../../../../../../components/Button/AnimatedButton.tsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { TenderlyTransactButton } from '../../../../../../components/Tenderly/Buttons/TenderlyTransactButton.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  transactClearInput,
  transactSetSuccessClosed,
} from '../../../../../data/actions/transact.ts';
import { transactSteps } from '../../../../../data/actions/wallet/transact.ts';
import { ActionRecovery } from '../CommonActions/ActionRecovery.tsx';
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
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import {
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
import { ActionConnectSwitch } from '../CommonActions/CommonActions.tsx';
import { ConfirmNotice } from '../ConfirmNotice/ConfirmNotice.tsx';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice.tsx';
import { GlpDepositNotice } from '../GlpNotices/GlpNotices.tsx';
import { MaxNativeNotice } from '../MaxNativeNotice/MaxNativeNotice.tsx';
import { NotEnoughNotice } from '../NotEnoughNotice/NotEnoughNotice.tsx';
import { PriceImpactNotice } from '../PriceImpactNotice/PriceImpactNotice.tsx';
import { VaultFees } from '../VaultFees/VaultFees.tsx';
import { styles } from './styles.ts';
import { getExecutionChainId } from '../../../../../../helpers/transactUtils.ts';
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

  if (stepperContent === StepContent.RecoveryTx || isRecoveryExecution || recoveryOp != null) {
    return <ActionRecovery mode="deposit" />;
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
  const stepperContent = useAppSelector(selectStepperStepContent);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const confirmNeededWithChanges = useAppSelector(selectTransactConfirmNeededWithChanges);
  const successClosed = useAppSelector(selectTransactSuccessClosed);
  const isSuccessTx = stepperContent === StepContent.SuccessTx;
  const isComplete = successClosed || isSuccessTx;
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

  const handleDeposit = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  const handleClose = useCallback(() => {
    dispatch(transactSetSuccessClosed(false));
    dispatch(transactClearInput());
    dispatch(stepperReset());
  }, [dispatch]);

  const isCreating =
    isExecuting ||
    (isTxInProgress &&
      (stepperContent === StepContent.StartTx || stepperContent === StepContent.WalletTx));
  const isLoading = isExecuting || isTxInProgress;

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
          <AnimatedButton
            variant="cta"
            loading={isComplete ? false : isLoading}
            isCreating={isComplete ? false : isCreating}
            isConfirmed={isComplete}
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={isComplete ? handleClose : handleDeposit}
          >
            {isComplete ?
              t('Transactn-Close')
            : isCreating ?
              t('Transact-CreatingTransaction')
            : isTxInProgress ?
              t('Transact-DepositInProgress')
            : confirmNeededWithChanges ?
              t(
                isMaxAll && !isCowDepositQuote ?
                  'Transact-ConfirmDepositAll'
                : 'Transact-ConfirmDeposit'
              )
            : t(isMaxAll && !isCowDepositQuote ? 'Transact-DepositAll' : 'Transact-Deposit')}
          </AnimatedButton>
        </ActionConnectSwitch>
        {import.meta.env.DEV ?
          <TenderlyTransactButton option={option} quote={quote} />
        : null}
        <VaultFees />
      </div>
    </>
  );
});
