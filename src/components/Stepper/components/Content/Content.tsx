import { css, cx } from '@repo/styles/css';
import type BigNumber from 'bignumber.js';
import { type FC, memo, type MouseEventHandler, type ReactNode, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import {
  transactClearInput,
  transactSetSuccessClosed,
} from '../../../../features/data/actions/transact.ts';
import { stepperReset } from '../../../../features/data/actions/wallet/stepper.ts';
import {
  crossChainFetchRecoveryQuote,
  crossChainRecoverySteps,
} from '../../../../features/data/actions/wallet/cross-chain.ts';
import { askForNetworkChange } from '../../../../features/data/actions/wallet.ts';
import { isWalletActionError } from '../../../../features/data/actions/wallet/wallet-action.ts';
import type { Step } from '../../../../features/data/reducers/wallet/stepper-types.ts';
import { TransactMode } from '../../../../features/data/reducers/wallet/transact-types.ts';
import { TransactStatus } from '../../../../features/data/reducers/wallet/transact-types.ts';
import type { BridgeAdditionalData } from '../../../../features/data/reducers/wallet/wallet-action-types.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { selectVaultById } from '../../../../features/data/selectors/vaults.ts';
import type { VaultEntity } from '../../../../features/data/entities/vault.ts';
import {
  selectBoostAdditionalData,
  selectBoostClaimed,
  selectBridgeSuccess,
  selectCrossChainDstDust,
  selectCrossChainDstReceived,
  selectCrossChainSrcReturned,
  selectIsStepperRecoveryExecution,
  selectIsStepperStepping,
  selectMintResult,
  selectStepperBridgeStatus,
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperItems,
  selectZapReturned,
} from '../../../../features/data/selectors/stepper.ts';
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
import { ShareButton } from '../../../../features/vault/components/ShareButton/ShareButton.tsx';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { explorerTxUrl } from '../../../../helpers/url.ts';
import { useAppDispatch, useAppSelector } from '../../../../features/data/store/hooks.ts';
import iconError from '../../../../images/icons/error.svg';
import { AnimatedButton } from '../../../Button/AnimatedButton.tsx';
import { Button } from '../../../Button/Button.tsx';
import { CircularProgress } from '../../../CircularProgress/CircularProgress.tsx';
import { ListJoin } from '../../../ListJoin.tsx';
import { SpinLoader } from '../../../SpinLoader/SpinLoader.tsx';
import { Title } from '../Title/Title.tsx';
import { TransactionLink } from '../TransactionLink/TransactionLink.tsx';
import { styles } from './styles.ts';
import { ExternalLink } from '../../../Links/ExternalLink.tsx';

const useStyles = legacyMakeStyles(styles);

export const StepsStartContent = memo(function StepsStartContent() {
  const { t } = useTranslation();
  const classes = useStyles();
  const currentStepData = useAppSelector(selectStepperCurrentStepData);
  const currentStep = useAppSelector(selectStepperCurrentStep);
  const stepperItems = useAppSelector(selectStepperItems);

  return (
    <>
      <Title text={t('Transactn-Confirmed', { currentStep, totalTxs: stepperItems.length })} />
      <div className={classes.message}>
        {currentStepData ?
          <>
            <CircularProgress size={16} /> {t(`Stepper-${currentStepData.step}-Building-Content`)}
          </>
        : '...'}
      </div>
    </>
  );
});

export const StepsCountContent = memo(function StepsCountContent() {
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

export const WaitingContent = memo(function WaitingContent() {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Title text={t('Transactn-ConfirmPending')} />
      <div className={classes.message}>{t('Transactn-Wait')}</div>
    </>
  );
});

export const ErrorContent = memo(function ErrorContent() {
  const { t } = useTranslation();
  const classes = useStyles();
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const handleSelectAll = useCallback<MouseEventHandler<HTMLDivElement>>(e => {
    if (e.target instanceof HTMLElement && window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.selectAllChildren(e.target);
      }
    }
  }, []);

  if (!isWalletActionError(walletActionsState)) {
    return null;
  }

  return (
    <>
      <Title
        text={
          <>
            <img className={classes.icon} src={iconError} alt="error" />
            {t('Transactn-Error')}
          </>
        }
      />

      <div className={css(styles.content, styles.errorContent)}>
        {walletActionsState.data.error.friendlyMessage && (
          <div className={classes.friendlyMessage}>
            {walletActionsState.data.error.friendlyMessage}
          </div>
        )}
        <div className={cx(classes.errorMessage, 'scrollbar')} onClick={handleSelectAll}>
          {walletActionsState.data.error.message}
        </div>
      </div>
      <div className={classes.buttons}>
        <CloseButton />
      </div>
    </>
  );
});

export const CloseButton = memo(function CloseButton() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch(transactSetSuccessClosed(false));
    dispatch(transactClearInput());
    dispatch(stepperReset());
  }, [dispatch]);

  return (
    <Button borderless={true} fullWidth={true} variant="default" onClick={handleClose}>
      {t('Transactn-Close')}
    </Button>
  );
});

type SuccessContentProps = {
  step: Step;
};

function formatTokenAmountsList(
  items: { amount: BigNumber; token: { decimals: number; symbol: string } }[]
) {
  return (
    <ListJoin
      items={items.map(
        item =>
          `${formatTokenDisplayCondensed(item.amount, item.token.decimals)} ${item.token.symbol}`
      )}
    />
  );
}

function formatTokenAmountsWithChain(
  items: { amount: BigNumber; token: { decimals: number; symbol: string }; chainName: string }[]
) {
  return (
    <ListJoin
      items={items.map(
        item =>
          `${formatTokenDisplayCondensed(item.amount, item.token.decimals)} ${item.token.symbol} on ${item.chainName}`
      )}
    />
  );
}

const ZapSuccessContent = memo(function ZapSuccessContent({ step }: SuccessContentProps) {
  const { t } = useTranslation();
  const returned = useAppSelector(selectZapReturned);
  const srcReturned = useAppSelector(selectCrossChainSrcReturned);
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const pendingOp = useAppSelector(state =>
    bridgeStatus?.opId ? state.ui.transact.crossChain.pendingOps[bridgeStatus.opId] : undefined
  );
  const vault = useAppSelector(state =>
    pendingOp?.vaultId ? selectVaultById(state, pendingOp.vaultId) : undefined
  );
  const srcChain = useAppSelector(state =>
    pendingOp?.sourceChainId ? selectChainById(state, pendingOp.sourceChainId) : undefined
  );
  const destChain = useAppSelector(state =>
    pendingOp?.destChainId ? selectChainById(state, pendingOp.destChainId) : undefined
  );
  const dstReceived = useAppSelector(selectCrossChainDstReceived);
  const dstDust = useAppSelector(selectCrossChainDstDust);

  const isCrossChain = !!pendingOp && !!vault && !!srcChain && !!destChain;

  const dust = useMemo(() => {
    if (!isCrossChain) {
      if (returned.length) {
        return formatTokenAmountsList(returned);
      }
      return undefined;
    }

    const allDust: {
      amount: BigNumber;
      token: { decimals: number; symbol: string };
      chainName: string;
    }[] = [];
    for (const item of srcReturned) {
      allDust.push({ ...item, chainName: srcChain.name });
    }
    for (const item of dstDust) {
      allDust.push({ ...item, chainName: destChain.name });
    }
    if (allDust.length) {
      return formatTokenAmountsWithChain(allDust);
    }
    return undefined;
  }, [isCrossChain, returned, dstDust, srcReturned, srcChain, destChain]);

  const title = useMemo(() => {
    if (isCrossChain) {
      return pendingOp.direction === 'withdraw' ?
          t('Stepper-CrossChain-Withdraw-Success-Title')
        : t('Stepper-CrossChain-Deposit-Success-Title');
    }
    return t(`Stepper-${step.step}-Success-Title`);
  }, [isCrossChain, pendingOp, step.step, t]);

  const receivedLine = useMemo(() => {
    if (isCrossChain && dstReceived.length) {
      let displayItems;
      if (pendingOp.direction === 'deposit' && vault.assetType !== 'single') {
        displayItems = dstReceived.map(item => ({
          ...item,
          token: { ...item.token, symbol: 'LP' },
        }));
      } else if (pendingOp.direction === 'withdraw') {
        const outputSymbol = pendingOp.expectedOutput.token.symbol;
        displayItems = dstReceived.map(item => ({
          ...item,
          token: { ...item.token, symbol: outputSymbol },
        }));
      } else {
        displayItems = dstReceived;
      }
      const received = formatTokenAmountsList(displayItems);
      return (
        <Trans
          t={t}
          i18nKey={
            pendingOp.direction === 'withdraw' ?
              'Stepper-CrossChain-Withdraw-Received'
            : 'Stepper-CrossChain-Deposit-Received'
          }
          components={{ received }}
        />
      );
    }
    return undefined;
  }, [isCrossChain, dstReceived, pendingOp, vault, t]);

  const dustLine = useMemo(() => {
    if (dust) {
      return <Trans t={t} i18nKey="Stepper-Dust" components={{ dust }} />;
    }
    return undefined;
  }, [dust, t]);

  const message = useMemo(() => {
    if (isCrossChain) {
      const { sourceInput, expectedOutput } = pendingOp;
      const inputAmount = formatTokenDisplayCondensed(
        sourceInput.amount,
        sourceInput.token.decimals
      );
      const vaultChain = pendingOp.direction === 'deposit' ? destChain : srcChain;

      const mainText =
        pendingOp.direction === 'withdraw' ?
          t('Stepper-CrossChain-Withdraw-Success-Content', {
            amount: inputAmount,
            token: sourceInput.token.symbol,
            vaultName: vault.names.singleMeta,
            vaultChain: vaultChain.name,
            outputToken: expectedOutput.token.symbol,
            destChain: destChain.name,
          })
        : t('Stepper-CrossChain-Deposit-Success-Content', {
            amount: inputAmount,
            token: sourceInput.token.symbol,
            srcChain: srcChain.name,
            vaultName: vault.names.singleMeta,
            vaultChain: vaultChain.name,
          });

      const hasExtra = receivedLine || dustLine;
      return (
        <>
          <div>{mainText}</div>
          {hasExtra ?
            <div style={{ marginTop: '12px' }}>
              {receivedLine}
              {receivedLine && dustLine ? ' ' : null}
              {dustLine}
            </div>
          : null}
        </>
      );
    }
    return t(`Stepper-${step.step}-Success-Content`);
  }, [isCrossChain, pendingOp, vault, srcChain, destChain, step.step, t, receivedLine, dustLine]);

  const messageHighlight = useMemo(() => {
    if (!isCrossChain && dust) {
      return <Trans t={t} i18nKey="Stepper-Dust" components={{ dust }} />;
    }
    return undefined;
  }, [isCrossChain, dust, t]);

  const isDeposit = isCrossChain ? pendingOp.direction === 'deposit' : step.step === 'zap-in';

  return (
    <SuccessContentDisplay
      title={title}
      message={message}
      messageHighlight={messageHighlight}
      rememberTitle={isDeposit ? t('Remember') : undefined}
      rememberMessage={isDeposit ? t('Remember-Msg') : undefined}
      shareVaultId={isDeposit ? step.extraInfo?.vaultId || pendingOp?.vaultId : undefined}
    />
  );
});

const MintSuccessContent = memo(function MintSuccessContent({ step }: SuccessContentProps) {
  const { t } = useTranslation();
  const { type, amount, token } = useAppSelector(selectMintResult);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-${type}-Success-Content`, { amount, token: token.symbol })}
    />
  );
});

const BridgeSuccessContent = memo<SuccessContentProps>(function BridgeSuccessContent() {
  const { t } = useTranslation();
  const classes = useStyles();
  const walletAction = useAppSelector(selectBridgeSuccess);
  const { hash } = walletAction.data;
  const { quote } = walletAction.additional as BridgeAdditionalData; // FIXME could be undefined
  const bridgeExplorerUrl = quote.config.explorerUrl;
  const fromChain = useAppSelector(state => selectChainById(state, quote.input.token.chainId));
  const toChain = useAppSelector(state => selectChainById(state, quote.output.token.chainId));
  const explorerUrl = useMemo(() => {
    if (bridgeExplorerUrl) {
      return bridgeExplorerUrl.replace('{{hash}}', hash);
    }
    return explorerTxUrl(fromChain, hash);
  }, [fromChain, hash, bridgeExplorerUrl]);

  return (
    <>
      <Title text={t('Stepper-bridge-Success-Title')} />
      <div className={css(styles.content, styles.successContent)}>
        <div className={classes.message}>
          {t('Stepper-bridge-Success-Content', { from: fromChain.name })}
        </div>
        <div className={classes.messageHighlight}>
          <Trans
            t={t}
            i18nKey={
              bridgeExplorerUrl ?
                'Stepper-bridge-Success-Track-Incoming'
              : 'Stepper-bridge-Success-Track-Outgoing'
            }
            components={{
              Link: <ExternalLink href={explorerUrl} className={classes.link} />,
            }}
            values={{ to: toChain.name, from: fromChain.name, provider: quote.config.title }}
          />
        </div>
      </div>
      <div className={classes.buttons}>
        <CloseButton />
      </div>
    </>
  );
});

const BoostStakeSuccessContent = memo(function BoostStakeSuccessContent({
  step,
}: SuccessContentProps) {
  const { t } = useTranslation();
  const data = useAppSelector(selectBoostAdditionalData);
  const token = data?.token.symbol || 'UNKNOWN';
  const amount = data?.amount || BIG_ZERO;

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-Success-Content`, { amount, token })}
      rememberTitle={t('Remember')}
      rememberMessage={t('Remember-Msg-Boost')}
    />
  );
});

const BoostUnstakeSuccessContent = memo(function BoostUnstakeSuccessContent({
  step,
}: SuccessContentProps) {
  const { t } = useTranslation();
  const data = useAppSelector(selectBoostAdditionalData);
  const token = data?.token.symbol || 'UNKNOWN';
  const amount = data?.amount || BIG_ZERO;
  const claimedTokenAmounts = useAppSelector(selectBoostClaimed);
  const claimed = useMemo(() => {
    if (claimedTokenAmounts.length) {
      return (
        <ListJoin
          items={claimedTokenAmounts.map(
            item =>
              `${formatTokenDisplayCondensed(item.amount, item.token.decimals)} ${
                item.token.symbol
              }`
          )}
        />
      );
    }
    return undefined;
  }, [claimedTokenAmounts]);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-Success-Content`, { amount, token })}
      messageHighlight={
        claimed ?
          <Trans t={t} i18nKey={`Stepper-boost-claim-Rewards`} components={{ claimed }} />
        : undefined
      }
    />
  );
});

const FallbackSuccessContent = memo(function FallbackSuccessContent({ step }: SuccessContentProps) {
  const { t } = useTranslation();
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const hasRememberMsg = step.step === 'deposit';
  const rememberMsg = useMemo(() => {
    if (step.step === 'deposit') {
      return 'Remember-Msg';
    }
    return '';
  }, [step.step]);

  const textParams = useMemo(() => {
    if (step.extraInfo?.rewards) {
      return {
        amount: formatTokenDisplayCondensed(
          walletActionsState?.additional?.amount || BIG_ZERO,
          walletActionsState?.additional?.token?.decimals || 18
        ),
        token: walletActionsState?.additional?.token.symbol || 'unknown',
        rewards: formatTokenDisplayCondensed(
          step.extraInfo.rewards.amount,
          step.extraInfo.rewards.token.decimals
        ),
        rewardToken: step.extraInfo.rewards.token.symbol,
      };
    }
    return {
      amount: formatTokenDisplayCondensed(
        walletActionsState?.additional?.amount || BIG_ZERO,
        walletActionsState?.additional?.token?.decimals || 18
      ),
      token: walletActionsState.additional?.token.symbol || 'unknown',
    };
  }, [step.extraInfo?.rewards, walletActionsState]);

  const successMessage = useMemo(() => {
    return t(`Stepper-${step.step}-Success-Content`, { ...textParams });
  }, [step.step, t, textParams]);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={successMessage}
      rememberTitle={hasRememberMsg ? t('Remember') : undefined}
      rememberMessage={hasRememberMsg ? t(rememberMsg) : undefined}
      shareVaultId={
        step.step === 'deposit' || step.step === 'deposit-gov' ? step.extraInfo?.vaultId : undefined
      }
    />
  );
});

type SuccessContentDisplayProps = {
  title: string;
  message: ReactNode;
  messageHighlight?: ReactNode;
  rememberTitle?: string;
  rememberMessage?: ReactNode;
  shareVaultId?: VaultEntity['id'];
};
const SuccessContentDisplay = memo(function SuccessContentDisplay({
  title,
  message,
  messageHighlight,
  rememberTitle,
  rememberMessage,
  shareVaultId,
}: SuccessContentDisplayProps) {
  const classes = useStyles();

  return (
    <>
      <Title text={title} />
      <div className={css(styles.content, styles.successContent)}>
        <div className={classes.message}>{message}</div>
        {messageHighlight ?
          <div className={classes.messageHighlight}>{messageHighlight}</div>
        : null}
        <TransactionLink />
      </div>
      {rememberTitle && rememberMessage ?
        <div className={classes.rememberContainer}>
          <div className={classes.message}>
            <span>{rememberTitle}</span> {rememberMessage}
          </div>
        </div>
      : null}
      <div className={classes.buttons}>
        {shareVaultId ?
          <ShareButton vaultId={shareVaultId} placement="bottom-start" />
        : null}
        <CloseButton />
      </div>
    </>
  );
});

type StepToSuccessContent = {
  [key in Step['step']]?: FC<SuccessContentProps>;
};

const stepToSuccessContent: StepToSuccessContent = {
  'zap-in': ZapSuccessContent,
  'zap-out': ZapSuccessContent,
  mint: MintSuccessContent,
  bridge: BridgeSuccessContent,
  'boost-stake': BoostStakeSuccessContent,
  'boost-unstake': BoostUnstakeSuccessContent,
  'boost-claim-unstake': BoostUnstakeSuccessContent,
  'boost-claim': BoostUnstakeSuccessContent,
};

export const BridgingContent = memo(function BridgingContent() {
  const { t } = useTranslation();
  const classes = useStyles();
  const mode = useAppSelector(selectTransactMode);
  const titleKey =
    mode === TransactMode.Withdraw ? 'Transactn-Bridging-Withdraw' : 'Transactn-Bridging-Deposit';

  return (
    <>
      <Title
        text={
          <>
            {t(titleKey)}
            <SpinLoader size={20} css={css.raw({ marginLeft: '8px' })} />
          </>
        }
      />
      <div className={css(styles.content, styles.bridgingContent)}>
        <div className={classes.message}>{t('Transactn-Bridging-Wait')}</div>
      </div>
    </>
  );
});

export const RecoveryContent = memo(function RecoveryContent() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isRecoveryExecution = useAppSelector(selectIsStepperRecoveryExecution);
  const recoveryQuoteStatus = useAppSelector(selectCrossChainRecoveryQuoteStatus);
  const recoveryQuoteOpId = useAppSelector(selectCrossChainRecoveryQuoteOpId);
  const isExecuting = useAppSelector(selectTransactExecuting);

  const opId = bridgeStatus?.opId ?? recoveryQuoteOpId;
  const destChainId = bridgeStatus?.destChainId;
  const isOnCorrectChain = connectedChainId === destChainId;
  const isFetchingQuote = recoveryQuoteStatus === TransactStatus.Pending;

  const hasValidQuote =
    opId != null && recoveryQuoteOpId === opId && recoveryQuoteStatus === TransactStatus.Fulfilled;
  const needsNewQuote = !isRecoveryExecution && !hasValidQuote;

  const titleKey =
    mode === TransactMode.Withdraw ? 'Transactn-Bridging-Withdraw' : 'Transactn-Bridging-Deposit';
  const messageKey =
    mode === TransactMode.Withdraw ? 'Transactn-Recovery-Withdraw' : 'Transactn-Recovery-Deposit';

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

  const finaliseNoun = mode === TransactMode.Withdraw ? t('Withdraw-noun') : t('Deposit-noun');

  let actionButton: ReactNode;
  if (!isWalletConnected) {
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
      <AnimatedButton
        needFire={true}
        variant="recovery"
        fullWidth={true}
        borderless={true}
        disabled={isTxInProgress || isExecuting}
        onClick={handleFinalise}
      >
        {t('Transact-Finalise', { type: finaliseNoun })}
      </AnimatedButton>
    );
  } else if (needsNewQuote) {
    actionButton = (
      <AnimatedButton
        needFire={true}
        variant="recovery"
        fullWidth={true}
        borderless={true}
        disabled={isTxInProgress || isFetchingQuote || !opId}
        onClick={handleFetchQuote}
      >
        {isFetchingQuote ? t('Transact-FetchingQuote') : t('Transact-FetchNewQuote')}
      </AnimatedButton>
    );
  }

  return (
    <>
      <Title text={t(titleKey)} />
      <div className={css(styles.content, styles.recoveryContent)}>
        <div className={classes.message}>{t(messageKey)}</div>
      </div>
      {actionButton ?
        <div className={classes.buttons}>{actionButton}</div>
      : null}
    </>
  );
});

export const SuccessContent = memo(function SuccessContent() {
  const step = useAppSelector(selectStepperCurrentStepData);
  const Component = stepToSuccessContent[step.step] || FallbackSuccessContent;
  return <Component step={step} />;
});
