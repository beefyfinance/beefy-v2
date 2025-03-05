import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { css, cx } from '@repo/styles/css';
import { type FC, memo, type MouseEventHandler, type ReactNode, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { Step } from '../../../../features/data/reducers/wallet/stepper.ts';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper.ts';
import {
  selectBoostAdditionalData,
  selectBoostClaimed,
  selectBridgeSuccess,
  selectMintResult,
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperItems,
  selectZapReturned,
} from '../../../../features/data/selectors/stepper.ts';
import { formatTokenDisplayCondensed } from '../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../store.ts';
import { Button } from '../../../Button/Button.tsx';
import { TransactionLink } from '../TransactionLink/TransactionLink.tsx';
import { walletActions } from '../../../../features/data/actions/wallet-actions.ts';
import { styles } from './styles.ts';
import { Title } from '../Title/Title.tsx';
import { ListJoin } from '../../../ListJoin.tsx';
import iconError from '../../../../images/icons/error.svg';
import { ShareButton } from '../../../../features/vault/components/ShareButton/ShareButton.tsx';
import type { VaultEntity } from '../../../../features/data/entities/vault.ts';
import {
  type BridgeAdditionalData,
  isWalletActionError,
} from '../../../../features/data/reducers/wallet/wallet-action.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { explorerTxUrl } from '../../../../helpers/url.ts';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { CircularProgress } from '../../../CircularProgress/CircularProgress.tsx';

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
        {currentStepData ? (
          <>
            <CircularProgress size={16} /> {t(`Stepper-${currentStepData.step}-Building-Content`)}
          </>
        ) : (
          '...'
        )}
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
        const range = document.createRange();
        range.selectNodeContents(e.target);
        selection.removeAllRanges();
        selection.addRange(range);
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
    dispatch(stepperActions.reset());
    dispatch(walletActions.resetWallet());
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

const ZapSuccessContent = memo(function ZapSuccessContent({ step }: SuccessContentProps) {
  const { t } = useTranslation();
  const returned = useAppSelector(selectZapReturned);

  const dust = useMemo(() => {
    if (returned.length) {
      return (
        <ListJoin
          items={returned.map(
            item =>
              `${formatTokenDisplayCondensed(item.amount, item.token.decimals)} ${
                item.token.symbol
              }`
          )}
        />
      );
    }
    return undefined;
  }, [returned]);

  return (
    <SuccessContentDisplay
      title={t(`Stepper-${step.step}-Success-Title`)}
      message={t(`Stepper-${step.step}-Success-Content`)}
      messageHighlight={
        dust ? <Trans t={t} i18nKey={`Stepper-Dust`} components={{ dust }} /> : undefined
      }
      rememberTitle={step.step === 'zap-in' ? t('Remember') : undefined}
      rememberMessage={step.step === 'zap-in' ? t('Remember-Msg') : undefined}
      shareVaultId={step.step === 'zap-in' ? step.extraInfo?.vaultId || undefined : undefined}
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
              bridgeExplorerUrl
                ? 'Stepper-bridge-Success-Track-Incoming'
                : 'Stepper-bridge-Success-Track-Outgoing'
            }
            components={{
              Link: (
                <a href={explorerUrl} className={classes.link} target={'_blank'} rel={'noopener'} />
              ),
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
        claimed ? (
          <Trans t={t} i18nKey={`Stepper-boost-claim-Rewards`} components={{ claimed }} />
        ) : undefined
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
        {messageHighlight ? (
          <div className={classes.messageHighlight}>{messageHighlight}</div>
        ) : null}
        <TransactionLink />
      </div>
      {rememberTitle && rememberMessage ? (
        <div className={classes.rememberContainer}>
          <div className={classes.message}>
            <span>{rememberTitle}</span> {rememberMessage}
          </div>
        </div>
      ) : null}
      <div className={classes.buttons}>
        {shareVaultId ? <ShareButton vaultId={shareVaultId} placement="bottom-start" /> : null}
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

export const SuccessContent = memo(function SuccessContent() {
  const step = useAppSelector(selectStepperCurrentStepData);
  const Component = stepToSuccessContent[step.step] || FallbackSuccessContent;
  return <Component step={step} />;
});
