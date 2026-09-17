import { memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import { AnimatedButton } from '../../../../../../components/Button/AnimatedButton.tsx';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  transactClearQuotes,
  transactFetchQuotes,
  transactSetInputAmount,
  transactSetSuccessClosed,
  transactSwitchMode,
} from '../../../../../data/actions/transact.ts';
import { transactSteps } from '../../../../../data/actions/wallet/transact.ts';
import { stepperReset } from '../../../../../data/actions/wallet/stepper.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import {
  TransactMode,
  TransactStatus,
} from '../../../../../data/reducers/wallet/transact-types.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { isZapQuote } from '../../../../../data/apis/transact/transact-types.ts';
import { selectUserVaultBalanceInShareToken } from '../../../../../data/selectors/balance.ts';
import {
  selectIsStepperStepping,
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactConfirmNeededWithChanges,
  selectTransactExecuting,
  selectTransactInputAmounts,
  selectTransactOptionsStatus,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactSlippage,
  selectTransactSuccessClosed,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { ActionConnectSwitch } from '../CommonActions/CommonActions.tsx';
import { ConfirmNotice } from '../ConfirmNotice/ConfirmNotice.tsx';
import { PriceImpactNotice } from '../PriceImpactNotice/PriceImpactNotice.tsx';
import { usePriceImpactState } from '../hooks/usePriceImpactState.ts';
import { useConfirmDisabled } from '../hooks/useActionGates.ts';
import { QuoteErrorAlert, QuoteRetryAlert } from '../QuoteErrorAlert/QuoteErrorAlert.tsx';
import { quoteRetryOf, useQuoteAutoRefresh } from '../hooks/useQuoteAutoRefresh.ts';
import { ZapRoute, ZapRoutePlaceholder } from '../ZapRoute/ZapRoute.tsx';
import { ZapSlippage } from '../ZapSlippage/ZapSlippage.tsx';
import { VaultFees } from '../VaultFees/VaultFees.tsx';

type MigrateActionsProps = {
  oldVaultId: VaultEntity['id'];
  newVaultId: VaultEntity['id'];
};

export const MigrateActions = memo(function MigrateActions({
  oldVaultId,
  newVaultId,
}: MigrateActionsProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const newVault = useAppSelector(state => selectVaultById(state, newVaultId));

  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quoteError = useAppSelector(selectTransactQuoteError);
  const slippage = useAppSelector(selectTransactSlippage);
  const isStepping = useAppSelector(selectIsStepperStepping);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const stepperContent = useAppSelector(selectStepperStepContent);
  const successClosed = useAppSelector(selectTransactSuccessClosed);
  const confirmNeededWithChanges = useAppSelector(selectTransactConfirmNeededWithChanges);

  const migratableBalance = useAppSelector(state =>
    selectUserVaultBalanceInShareToken(state, oldVaultId)
  );
  const hasNothingToMigrate = migratableBalance.isZero();

  const optionsStatus = useAppSelector(selectTransactOptionsStatus);
  const inputAmounts = useAppSelector(selectTransactInputAmounts);
  const hasInput = inputAmounts.some(amount => amount.gt(0));
  const isReadyToPreview = optionsStatus === TransactStatus.Fulfilled && hasInput;

  const isDisabledByConfirm = useConfirmDisabled();
  const priceImpactState = usePriceImpactState(quote);
  const { stickyRetry, showAutoRefresh, autoRefreshSeconds } = useQuoteAutoRefresh();

  const fetchQuote = useCallback(() => {
    dispatch(transactFetchQuotes());
  }, [dispatch]);

  // re-quote when slippage changes, but only once a quote has been previewed and not mid-stepper
  const skipInitialSlippageRequote = useRef(true);
  useEffect(() => {
    if (skipInitialSlippageRequote.current) {
      skipInitialSlippageRequote.current = false;
      return;
    }
    if (quote && !isStepping && !hasNothingToMigrate) {
      dispatch(transactFetchQuotes());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on slippage only
  }, [slippage]);

  // prefill middleware only fires on a fresh fetch; re-fill on remount when options are cached
  useEffect(() => {
    if (optionsStatus === TransactStatus.Fulfilled && !hasInput && migratableBalance.gt(0)) {
      dispatch(transactSetInputAmount({ index: 0, amount: migratableBalance, max: true }));
    }
  }, [dispatch, optionsStatus, hasInput, migratableBalance]);

  // clear on unmount so deposit/withdraw don't inherit the migrate quote
  useEffect(() => {
    return () => {
      dispatch(transactClearQuotes());
    };
  }, [dispatch]);

  const handleMigrate = useCallback(() => {
    if (quote) {
      dispatch(transactSteps(quote, t));
    }
  }, [dispatch, quote, t]);

  const handleClose = useCallback(() => {
    dispatch(transactSetSuccessClosed(false));
    dispatch(transactClearQuotes());
    dispatch(stepperReset());
    dispatch(transactSwitchMode(TransactMode.Deposit));
  }, [dispatch]);

  const effectiveDisabledByConfirm = isDisabledByConfirm && !confirmNeededWithChanges;

  const isSuccessTx = stepperContent === StepContent.SuccessTx;
  const isComplete = successClosed || isSuccessTx;
  const isCreating =
    isExecuting ||
    (isStepping &&
      (stepperContent === StepContent.StartTx || stepperContent === StepContent.WalletTx));

  const isDisabled =
    !isComplete &&
    (isStepping ||
      isExecuting ||
      hasNothingToMigrate ||
      priceImpactState.isDisabled ||
      effectiveDisabledByConfirm);
  const isLoading = isExecuting || isStepping;
  const isQuotePending = quoteStatus === TransactStatus.Pending;
  const hasQuote = quoteStatus === TransactStatus.Fulfilled && !!quote;
  // keep the refresh control mounted while retrying, even when the countdown is paused
  const retrying =
    !!stickyRetry || (quoteStatus === TransactStatus.Rejected && !!quoteRetryOf(quoteError));

  if (hasQuote && isZapQuote(quote)) {
    return (
      <>
        <ZapRoute
          quote={quote}
          expandable={true}
          enableRefresh={!isComplete}
          autoRefresh={showAutoRefresh}
          autoRefreshSeconds={autoRefreshSeconds}
        />
        <ZapSlippage />
        <PriceImpactNotice state={priceImpactState} />
        <ConfirmNotice />
        <ActionsContainer>
          <ActionConnectSwitch chainId={newVault.chainId}>
            <AnimatedButton
              variant="cta"
              fullWidth={true}
              borderless={true}
              loading={isComplete ? false : isLoading}
              isCreating={isComplete ? false : isCreating}
              isConfirmed={isComplete}
              disabled={isDisabled}
              onClick={isComplete ? handleClose : handleMigrate}
            >
              {isComplete ?
                t('Transactn-Close')
              : isCreating ?
                t('Transact-CreatingTransaction')
              : isStepping ?
                t('Transact-DepositInProgress')
              : confirmNeededWithChanges ?
                t('ReplacementVault-Confirm')
              : t('ReplacementVault-Action')}
            </AnimatedButton>
          </ActionConnectSwitch>
          <VaultFees />
        </ActionsContainer>
      </>
    );
  }

  return (
    <>
      <ZapRoutePlaceholder
        enableRefresh={
          retrying ?
            isQuotePending ?
              'disabled'
            : true
          : false
        }
        autoRefresh={showAutoRefresh}
        autoRefreshSeconds={autoRefreshSeconds}
      />
      {quoteStatus === TransactStatus.Rejected && quoteError ?
        <QuoteErrorAlert error={quoteError} action="deposit" fallbackKey="ReplacementVault-Error" />
      : stickyRetry ?
        <QuoteRetryAlert retry={stickyRetry} />
      : null}
      <ActionsContainer>
        <ActionConnectSwitch chainId={newVault.chainId}>
          <Button
            onClick={fetchQuote}
            variant="cta"
            fullWidth={true}
            borderless={true}
            disabled={isQuotePending || !isReadyToPreview}
          >
            {isQuotePending ? t('ReplacementVault-Loading') : t('ReplacementVault-Start')}
          </Button>
        </ActionConnectSwitch>
        <VaultFees />
      </ActionsContainer>
    </>
  );
});

const ActionsContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.content.light',
    borderRadius: '8px',
  },
});
