import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatedButton } from '../../../../../../components/Button/AnimatedButton.tsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { TenderlyTransactButton } from '../../../../../../components/Tenderly/Buttons/TenderlyTransactButton.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSteps } from '../../../../../data/actions/wallet/transact.ts';
import type {
  CrossChainWithdrawQuote,
  GovComposerZapWithdrawQuote,
  GovVaultWithdrawQuote,
  TransactOption,
  TransactQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCrossChainWithdrawQuote,
  isGovComposerWithdrawQuote,
  isGovVaultWithdrawQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCowcentratedLikeVault,
  isGovVault,
  type VaultGov,
} from '../../../../../data/entities/vault.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectIsStepperStepping,
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactConfirmNeededWithChanges,
  selectTransactExecuting,
  selectTransactForceSelection,
  selectTransactQuoteStatus,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactSuccessClosed,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import {
  selectGovVaultById,
  selectIsVaultGov,
  selectVaultById,
} from '../../../../../data/selectors/vaults.ts';
import { ActionConnectSwitchWithFees as ActionConnectSwitch } from './ActionConnectSwitch.tsx';
import { ConfirmNotice } from '../ConfirmNotice/ConfirmNotice.tsx';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice.tsx';
import { GlpWithdrawNotice } from '../GlpNotices/GlpNotices.tsx';
import { NotEnoughNotice } from '../NotEnoughNotice/NotEnoughNotice.tsx';
import { PriceImpactNotice } from '../PriceImpactNotice/PriceImpactNotice.tsx';
import { ScreamAvailableLiquidityNotice } from '../ScreamAvailableLiquidityNotice/ScreamAvailableLiquidityNotice.tsx';
import { VaultFees } from '../VaultFees/VaultFees.tsx';
import { styles } from './styles.ts';
import { getExecutionChainId } from '../../../../../../helpers/transactUtils.ts';
import {
  transactClearInput,
  transactSetSuccessClosed,
} from '../../../../../data/actions/transact.ts';
import { stepperReset } from '../../../../../data/actions/wallet/stepper.ts';
import { useTransactSelectFlowCta } from '../hooks/useTransactSelectFlowCta.ts';

const useStyles = legacyMakeStyles(styles);

export const WithdrawActions = memo(function WithdrawActions() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const isGovVault = useAppSelector(state => selectIsVaultGov(state, vaultId));

  if (isGovVault) {
    return <WithdrawActionsGov />;
  }

  return <WithdrawActionsStandard />;
});

export const WithdrawActionsStandard = memo(function WithdrawActionsStandard() {
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const option = quote ? quote.option : null;
  const successClosed = useAppSelector(selectTransactSuccessClosed);
  const isSuccessTx = useAppSelector(selectStepperStepContent) === StepContent.SuccessTx;

  if (successClosed || isSuccessTx) {
    return <ActionCloseWithdraw />;
  }

  if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled) {
    if (quoteStatus === TransactStatus.Pending) {
      return <ActionWithdrawPending />;
    }
    return <ActionWithdrawSelectFlow />;
  }

  return <ActionWithdraw quote={quote} option={option} />;
});

export const WithdrawActionsGov = memo(function WithdrawActionsGov() {
  const { t } = useTranslation();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId));
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const successClosed = useAppSelector(selectTransactSuccessClosed);
  const isSuccessTx = useAppSelector(selectStepperStepContent) === StepContent.SuccessTx;
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const connectSwitchChainId = forceSelection ? undefined : vault.chainId;

  if (successClosed || isSuccessTx) {
    return <ActionCloseWithdraw />;
  }

  const showWithdraw =
    quote &&
    (isGovVaultWithdrawQuote(quote) ||
      isGovComposerWithdrawQuote(quote) ||
      isCrossChainWithdrawQuote(quote)) &&
    quoteStatus === TransactStatus.Fulfilled;

  return (
    <>
      {showWithdraw ?
        <ActionClaimWithdraw quote={quote} vault={vault} />
      : quoteStatus === TransactStatus.Pending ?
        <ActionConnectSwitch
          css={styles.feesContainer}
          FeesComponent={VaultFees}
          chainId={connectSwitchChainId}
        >
          <div className={classes.feesContainer}>
            <Button variant="cta" disabled={true} fullWidth={true} borderless={true}>
              {t('Transact-Withdraw')}
            </Button>
            <VaultFees />
          </div>
        </ActionConnectSwitch>
      : <ActionWithdrawGovSelectFlow vault={vault} />}
    </>
  );
});

const ActionWithdrawPending = memo(function ActionWithdrawPending() {
  const { t } = useTranslation();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const connectSwitchChainId = forceSelection ? undefined : vault.chainId;

  return (
    <div className={classes.feesContainer}>
      <ActionConnectSwitch chainId={connectSwitchChainId}>
        <Button variant="cta" disabled={true} fullWidth={true} borderless={true}>
          {t('Transact-Withdraw')}
        </Button>
      </ActionConnectSwitch>
      {!isGovVault(vault) && <VaultFees />}
    </div>
  );
});

const ActionWithdrawSelectFlow = memo(function ActionWithdrawSelectFlow() {
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const { ctaLabel, openSelectStep } = useTransactSelectFlowCta();
  const connectSwitchChainId = forceSelection ? undefined : vault.chainId;

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
      {!isGovVault(vault) && <VaultFees />}
    </div>
  );
});

type ActionWithdrawGovSelectFlowProps = { vault: VaultGov };
const ActionWithdrawGovSelectFlow = memo(function ActionWithdrawGovSelectFlow({
  vault,
}: ActionWithdrawGovSelectFlowProps) {
  const classes = useStyles();
  const forceSelection = useAppSelector(selectTransactForceSelection);
  const { ctaLabel, openSelectStep } = useTransactSelectFlowCta();
  const connectSwitchChainId = forceSelection ? undefined : vault.chainId;

  return (
    <ActionConnectSwitch
      css={styles.feesContainer}
      FeesComponent={VaultFees}
      chainId={connectSwitchChainId}
    >
      <div className={classes.feesContainer}>
        <Button
          variant="cta"
          fullWidth={true}
          borderless={true}
          disabled={!forceSelection}
          onClick={forceSelection ? openSelectStep : undefined}
        >
          {ctaLabel}
        </Button>
        <VaultFees />
      </div>
    </ActionConnectSwitch>
  );
});

type ActionWithdrawProps = {
  option: TransactOption;
  quote: TransactQuote;
};
const ActionWithdraw = memo(function ActionWithdraw({ option, quote }: ActionWithdrawProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const [isDisabledByScreamLiquidity, setIsDisabledByScreamLiquidity] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const confirmNeededWithChanges = useAppSelector(selectTransactConfirmNeededWithChanges);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const executionChainId = useMemo(() => getExecutionChainId(quote), [quote]);

  const effectiveDisabledByConfirm = isDisabledByConfirm && !confirmNeededWithChanges;

  const isDisabled =
    isTxInProgress ||
    isExecuting ||
    isDisabledByPriceImpact ||
    effectiveDisabledByConfirm ||
    isDisabledByGlpLock ||
    isDisabledByScreamLiquidity ||
    isDisabledByNotEnoughInput;

  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  const isLoading = useMemo(() => isExecuting || isTxInProgress, [isExecuting, isTxInProgress]);

  return (
    <>
      {option.chainId === 'emerald' ?
        <EmeraldGasNotice />
      : null}
      <ScreamAvailableLiquidityNotice
        vaultId={option.vaultId}
        onChange={setIsDisabledByScreamLiquidity}
      />
      <GlpWithdrawNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="withdraw" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.feesContainer}>
        <ActionConnectSwitch chainId={executionChainId}>
          <AnimatedButton
            variant="cta"
            loading={isLoading}
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleClick}
          >
            {isExecuting ?
              t('Transact-CreatingTransaction')
            : isTxInProgress ?
              t('Transact-WithdrawInProgress')
            : t(isMaxAll ? 'Transact-WithdrawAll' : 'Transact-Withdraw')}
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

type ActionClaimWithdrawProps = {
  quote: GovVaultWithdrawQuote | GovComposerZapWithdrawQuote | CrossChainWithdrawQuote;
  vault: VaultGov;
};
const ActionClaimWithdraw = memo(function ActionClaimWithdraw({
  quote,
  vault,
}: ActionClaimWithdrawProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const option = quote.option;
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const confirmNeededWithChanges = useAppSelector(selectTransactConfirmNeededWithChanges);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);

  const effectiveDisabledByConfirm = isDisabledByConfirm && !confirmNeededWithChanges;

  const isDisabled =
    isTxInProgress ||
    isExecuting ||
    isDisabledByPriceImpact ||
    effectiveDisabledByConfirm ||
    isDisabledByNotEnoughInput;
  const showClaim = !isCowcentratedLikeVault(vault);

  const handleWithdraw = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  const isLoading = useMemo(() => isExecuting || isTxInProgress, [isExecuting, isTxInProgress]);

  return (
    <>
      {option.chainId === 'emerald' ?
        <EmeraldGasNotice />
      : null}
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="withdraw" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.feesContainer}>
        <ActionConnectSwitch
          FeesComponent={VaultFees}
          css={styles.feesContainer}
          chainId={option.chainId}
        >
          <AnimatedButton
            variant="cta"
            loading={isLoading}
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleWithdraw}
          >
            {isExecuting ?
              t('Transact-CreatingTransaction')
            : isTxInProgress ?
              t('Transact-WithdrawInProgress')
            : t(
                isMaxAll ?
                  quote.outputs.length > 1 && showClaim ?
                    'Transact-Claim-WithdrawAll'
                  : 'Transact-WithdrawAll'
                : 'Transact-Withdraw'
              )
            }
          </AnimatedButton>

          {import.meta.env.DEV ?
            <TenderlyTransactButton option={option} quote={quote} />
          : null}
          <VaultFees />
        </ActionConnectSwitch>
      </div>
    </>
  );
});

const ActionCloseWithdraw = memo(function ActionCloseWithdraw() {
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
      <AnimatedButton variant="cta" fullWidth={true} borderless={true} onClick={handleClose}>
        {t('Transactn-Close')}
      </AnimatedButton>
      <VaultFees />
    </div>
  );
});
