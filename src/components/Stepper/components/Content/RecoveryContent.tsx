import BigNumber from 'bignumber.js';
import { memo, type ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CCTP_CONFIG } from '../../../../config/cctp/cctp-config.ts';
import { askForNetworkChange } from '../../../../features/data/actions/wallet.ts';
import {
  crossChainFetchRecoveryQuote,
  crossChainRecoverySteps,
} from '../../../../features/data/actions/wallet/cross-chain.ts';
import { isWalletActionError } from '../../../../features/data/actions/wallet/wallet-action.ts';
import { TransactMode } from '../../../../features/data/reducers/wallet/transact-types.ts';
import { TransactStatus } from '../../../../features/data/reducers/wallet/transact-types.ts';
import { selectUserBalanceOfToken } from '../../../../features/data/selectors/balance.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import {
  selectIsStepperStepping,
  selectStepperBridgeStatus,
} from '../../../../features/data/selectors/stepper.ts';
import {
  selectChainNativeToken,
  selectTokenByAddress,
} from '../../../../features/data/selectors/tokens.ts';
import {
  selectCrossChainRecoveryQuoteOpId,
  selectCrossChainRecoveryQuoteStatus,
  selectTransactExecuting,
  selectTransactMode,
} from '../../../../features/data/selectors/transact.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../features/data/selectors/wallet.ts';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import { formatTokenDisplayCondensed } from '../../../../helpers/format.ts';
import { Button } from '../../../Button/Button.tsx';
import { Title } from '../Title/Title.tsx';
import { CloseButton } from './common/CloseButton.tsx';
import { Buttons, Content, Message } from './common/Common.tsx';

export const RecoveryContent = memo(function RecoveryContent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const recoveryQuoteStatus = useAppSelector(selectCrossChainRecoveryQuoteStatus);
  const recoveryQuoteOpId = useAppSelector(selectCrossChainRecoveryQuoteOpId);
  const isExecuting = useAppSelector(selectTransactExecuting);
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const hasError = isWalletActionError(walletActionsState);

  const opId = bridgeStatus?.opId ?? recoveryQuoteOpId;
  const pendingOp = useAppSelector(state =>
    opId ? state.ui.transact.crossChain.pendingOps[opId] : undefined
  );
  const destChainId = bridgeStatus?.destChainId;
  const destChain = useAppSelector(state =>
    destChainId ? selectChainById(state, destChainId) : undefined
  );
  const isOnCorrectChain = connectedChainId === destChainId;
  const isFetchingQuote = recoveryQuoteStatus === TransactStatus.Pending;

  const destNativeToken = useAppSelector(state =>
    destChainId ? selectChainNativeToken(state, destChainId) : undefined
  );
  const destNativeBalance = useAppSelector(state =>
    destNativeToken ?
      selectUserBalanceOfToken(state, destNativeToken.chainId, destNativeToken.address)
    : undefined
  );
  const hasNoGas = destNativeBalance !== undefined && destNativeBalance.isZero();

  // Resolve USDC token on dest chain for formatting
  const destCctpConfig = destChainId ? CCTP_CONFIG.chains[destChainId] : undefined;
  const destUsdcToken = useAppSelector(state =>
    destChainId && destCctpConfig ?
      selectTokenByAddress(state, destChainId, destCctpConfig.usdcAddress)
    : undefined
  );

  // dstRefundedAmount is the raw wei amount from the CCTP API; format with USDC decimals
  const rawRefund = bridgeStatus?.dstRefundedAmount;
  const isAbandoned =
    bridgeStatus?.lifecycleState === 'abandoned' && (rawRefund == null || rawRefund === '0');
  const hasRefundAmount = rawRefund != null && destUsdcToken != null;
  const formattedAmount = useMemo(() => {
    if (!hasRefundAmount) return '';
    const shifted = new BigNumber(rawRefund).shiftedBy(-destUsdcToken.decimals);
    return formatTokenDisplayCondensed(shifted, destUsdcToken.decimals);
  }, [hasRefundAmount, rawRefund, destUsdcToken]);

  const hasValidQuote =
    opId != null && recoveryQuoteOpId === opId && recoveryQuoteStatus === TransactStatus.Fulfilled;
  const needsNewQuote = !isExecuting && !hasValidQuote;

  const titleKey =
    mode === TransactMode.Withdraw ? 'Transactn-Bridging-Withdraw' : 'Transactn-Bridging-Deposit';

  const handleSwitchChain = useCallback(() => {
    if (destChainId) {
      dispatch(askForNetworkChange({ chainId: destChainId }));
    }
  }, [dispatch, destChainId]);

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

  const isUnknown = isAbandoned && pendingOp;
  const directionKey = mode === TransactMode.Withdraw ? 'Withdraw' : 'Deposit';
  const gasKey = hasNoGas ? '-NoGas' : '';
  // Only append "-Refresh" text when the Refresh button is the primary action
  const showRefreshButton = needsNewQuote && isWalletConnected && isOnCorrectChain && !isUnknown;
  const refreshKey = showRefreshButton ? '-Refresh' : '';
  const unknownKey = isUnknown ? '-Unknown' : '';
  const messageKey =
    isUnknown ?
      (`Transactn-Recovery-${directionKey}-Unknown` as const)
    : (`Transactn-Recovery-${directionKey}${gasKey}${refreshKey}` as const);

  const messageParams = {
    amount: formattedAmount,
    token: destUsdcToken?.symbol ?? 'USDC',
    chain: destChain?.name ?? '',
    gasToken: destNativeToken?.symbol ?? '',
  };

  const finaliseNoun = mode === TransactMode.Withdraw ? t('Withdraw-noun') : t('Deposit-noun');

  let actionButton: ReactNode;
  if (isUnknown) {
    actionButton = <CloseButton />;
  } else if (!isWalletConnected) {
    actionButton = null;
  } else if (!isOnCorrectChain && destChainId) {
    actionButton = (
      <Button
        variant="recovery"
        fullWidth={true}
        borderless={true}
        disabled={isTxInProgress}
        onClick={handleSwitchChain}
      >
        {t('Transact-RecoverySwitchChainType', { type: finaliseNoun })}
      </Button>
    );
  } else if (hasValidQuote) {
    actionButton = (
      <Button
        variant="recovery"
        fullWidth={true}
        borderless={true}
        disabled={isTxInProgress || isExecuting}
        onClick={handleFinalise}
      >
        {t('Transact-Finalise', { type: finaliseNoun })}
      </Button>
    );
  } else if (needsNewQuote) {
    actionButton = (
      <Button
        variant="recovery"
        fullWidth={true}
        borderless={true}
        disabled={isTxInProgress || isFetchingQuote || !opId}
        onClick={handleFetchQuote}
      >
        {isFetchingQuote ? t('Transact-FetchingQuote') : t('Transact-FetchNewQuote')}
      </Button>
    );
  }

  // Show Close alongside retry CTA after a failed attempt (!isUnknown: that branch has its own Close)
  const showCloseButton = hasError && !isUnknown;

  return (
    <>
      <Title text={t(titleKey)} />
      <Content variant="recovery">
        <Message>{t(messageKey, messageParams)}</Message>
        <Message variant="recoveryAction">
          {t(
            `Transactn-Recovery-Action${gasKey}${refreshKey}${unknownKey}` as const,
            messageParams
          )}
        </Message>
      </Content>
      {actionButton ?
        <Buttons layout={showCloseButton ? 'retryClose' : undefined}>
          {actionButton}
          {showCloseButton ?
            <CloseButton />
          : null}
        </Buttons>
      : null}
    </>
  );
});
