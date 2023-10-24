import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import type { ReactNode } from 'react';
import React, { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import type { Step } from '../../../../features/data/reducers/wallet/stepper';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';
import {
  selectBridgeSuccess,
  selectMintResult,
  selectStepperCurrentStep,
  selectStepperCurrentStepData,
  selectStepperItems,
  selectZapReturned,
} from '../../../../features/data/selectors/stepper';
import { formatBigDecimals } from '../../../../helpers/format';

import { useAppDispatch, useAppSelector } from '../../../../store';
import { Button } from '../../../Button';
import { TransactionLink } from '../TransactionLink';
import { walletActions } from '../../../../features/data/actions/wallet-actions';
import { styles } from './styles';
import { Title } from '../Title';
import { ListJoin } from '../../../ListJoin';
import iconError from '../../../../images/icons/error.svg';
import { ShareButton } from '../../../../features/vault/components/ShareButton';
import type { VaultEntity } from '../../../../features/data/entities/vault';
import { isWalletActionError } from '../../../../features/data/reducers/wallet/wallet-action';
import { selectChainById } from '../../../../features/data/selectors/chains';
import { explorerTxUrl } from '../../../../helpers/url';

const useStyles = makeStyles(styles);

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

      <div className={clsx(classes.content, classes.errorContent)}>
        {walletActionsState.data.error.friendlyMessage && (
          <div className={classes.friendlyMessage}>
            {walletActionsState.data.error.friendlyMessage}
          </div>
        )}
        <div className={classes.message}>{walletActionsState.data.error.message}</div>
      </div>
      <div className={classes.buttons}>
        <CloseButton />
      </div>
    </>
  );
});

export const CloseButton = memo(function CloseButton() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
    dispatch(walletActions.resetWallet());
  }, [dispatch]);

  return (
    <Button
      borderless={true}
      fullWidth={true}
      variant="middle"
      className={classes.closeBtn}
      onClick={handleClose}
    >
      {t('Transactn-Close')}
    </Button>
  );
});

type SuccessContentProps = {
  step: Step;
};

const ZapSuccessContent = memo<SuccessContentProps>(function ZapSuccessContent({ step }) {
  const { t } = useTranslation();
  const returned = useAppSelector(state => selectZapReturned(state, step.step));

  const dust = useMemo(() => {
    if (returned.length) {
      return (
        <ListJoin
          items={returned.map(
            item =>
              `${formatBigDecimals(item.amount, Math.min(item.token.decimals, 8))} ${
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
      shareVaultId={step.step === 'zap-in' ? step.extraInfo.vaultId : undefined}
    />
  );
});

const MintSuccessContent = memo<SuccessContentProps>(function MintSuccessContent({ step }) {
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
  const { quote, hash } = walletAction.data;
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
      <div className={clsx(classes.content, classes.successContent)}>
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

const FallbackSuccessContent = memo<SuccessContentProps>(function FallbackSuccessContent({ step }) {
  const { t } = useTranslation();
  const walletActionsState = useAppSelector(state => state.user.walletActions);
  const hasRememberMsg = step.step === 'deposit' || step.step === 'stake';
  const rememberMsg = useMemo(() => {
    if (step.step === 'deposit') {
      return 'Remember-Msg';
    }
    if (step.step === 'stake') {
      return 'Remember-Msg-Bst';
    }
    return '';
  }, [step.step]);

  const textParams = useMemo(() => {
    if (step.extraInfo?.rewards) {
      return {
        amount: formatBigDecimals(walletActionsState?.data.amount, 4),
        token: walletActionsState?.data.token.symbol,
        rewards: formatBigDecimals(step.extraInfo.rewards.amount),
        rewardToken: step.extraInfo.rewards.token.symbol,
      };
    }
    return {
      amount: formatBigDecimals(walletActionsState.data.amount, 4),
      token: walletActionsState.data.token.symbol,
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
const SuccessContentDisplay = memo<SuccessContentDisplayProps>(function SuccessContentDisplay({
  title,
  message,
  messageHighlight,
  rememberTitle,
  rememberMessage,
  shareVaultId,
}) {
  const classes = useStyles();

  return (
    <>
      <Title text={title} />
      <div className={clsx(classes.content, classes.successContent)}>
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
  [key in Step['step']]?: typeof FallbackSuccessContent;
};

const stepToSuccessContent: StepToSuccessContent = {
  'zap-in': ZapSuccessContent,
  'zap-out': ZapSuccessContent,
  mint: MintSuccessContent,
  bridge: BridgeSuccessContent,
};

export const SuccessContent = memo(function SuccessContent() {
  const step = useAppSelector(selectStepperCurrentStepData);
  const Component = stepToSuccessContent[step.step] || FallbackSuccessContent;
  return <Component step={step} />;
});
