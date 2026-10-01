import type { CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { fromUnixTime, isValid } from 'date-fns';
import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';
import { TimeUntil } from '../../../../../../components/TimeUntil/TimeUntil.tsx';
import type { SerializedError } from '../../../../../data/apis/transact/strategies/error-types.ts';
import {
  CrossChainBridgeBelowFeeError,
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotActionableError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
import {
  NOT_CALM_REFRESH_SECONDS,
  type QuoteRetry,
  type QuoteRetryAction,
} from '../hooks/useQuoteAutoRefresh.ts';

const CALM_DOCS_URL = 'https://docs.beefy.finance/beefy-products/clm#calmness-check';

type RetryAlertProps = {
  action: QuoteRetryAction;
  /** the surface re-quotes on a countdown; false falls back to plain "try again" copy */
  autoRetry?: boolean;
  css?: CssStyles;
};

const CalmAlert = memo(function CalmAlert({
  action,
  autoRetry = true,
  css: cssProp,
}: RetryAlertProps) {
  const { t } = useTranslation();
  // the countdown makes it self-healing, so it reads as a warning rather than an error
  const Alert = autoRetry ? AlertWarning : AlertError;

  return (
    <Alert css={cssProp}>
      <Trans
        t={t}
        i18nKey={
          autoRetry ?
            `Transact-Quote-Error-Calm-Retry-${action}`
          : `Transact-Quote-Error-Calm-${action}`
        }
        values={{ interval: NOT_CALM_REFRESH_SECONDS }}
        components={{ LinkCalm: <CalmLink href={CALM_DOCS_URL} /> }}
      />
    </Alert>
  );
});

type NotActionableAlertProps = RetryAlertProps & {
  /** unix seconds the vault is actionable again */
  actionableAt?: number;
};

const NotActionableAlert = memo(function NotActionableAlert({
  action,
  actionableAt,
  autoRetry = true,
  css: cssProp,
}: NotActionableAlertProps) {
  const { t } = useTranslation();
  const Alert = autoRetry ? AlertWarning : AlertError;
  const keyPrefix =
    autoRetry ? 'Transact-Quote-Error-NotActionable-Retry' : 'Transact-Quote-Error-NotActionable';
  // actionableAt is an unbounded uint256, so it may not fit in a Date
  const deadline = useMemo(() => {
    const date = actionableAt === undefined ? undefined : fromUnixTime(actionableAt);
    return date && isValid(date) ? date : undefined;
  }, [actionableAt]);
  const renderCountdown = useCallback(
    (timeLeft: string) => t(`${keyPrefix}-Countdown-${action}`, { timeLeft }),
    [t, keyPrefix, action]
  );
  const withoutCountdown = t(`${keyPrefix}-${action}`);

  return (
    <Alert css={cssProp}>
      {deadline ?
        <TimeUntil
          key={actionableAt}
          time={deadline}
          minParts={1}
          maxParts={2}
          padLength={1}
          renderFuture={renderCountdown}
          renderPast={withoutCountdown}
        />
      : withoutCountdown}
    </Alert>
  );
});

type QuoteRetryAlertProps = {
  retry: QuoteRetry;
  css?: CssStyles;
};

/** Alert for a quote error that clears on its own, on a surface that auto re-quotes. */
export const QuoteRetryAlert = memo(function QuoteRetryAlert({
  retry,
  css: cssProp,
}: QuoteRetryAlertProps) {
  return retry.kind === 'not-calm' ?
      <CalmAlert action={retry.action} css={cssProp} />
    : <NotActionableAlert action={retry.action} actionableAt={retry.actionableAt} css={cssProp} />;
});

export type QuoteErrorAlertProps = {
  error: SerializedError | undefined;
  /** used by the errors that don't carry their own action */
  action: QuoteRetryAction;
  /** shown when the error isn't one we recognise */
  fallbackKey?: string;
  /** the surface re-quotes on a countdown; false falls back to plain "try again" copy */
  autoRetry?: boolean;
  css?: CssStyles;
};

/** Shared rendering of a rejected quote, for every surface that fetches one. */
export const QuoteErrorAlert = memo(function QuoteErrorAlert({
  error,
  action,
  fallbackKey = 'Transact-Quote-Error',
  autoRetry = true,
  css: cssProp,
}: QuoteErrorAlertProps) {
  const { t } = useTranslation();

  if (error) {
    if (CrossChainBridgeBelowFeeError.match(error)) {
      return (
        <AlertError css={cssProp}>
          {t(`Transact-Quote-Error-CrossChain-TooLow-${action}`)}
        </AlertError>
      );
    }
    if (QuoteCowcentratedNoSingleSideError.match(error)) {
      return (
        <AlertError css={cssProp}>
          {t('Transact-Notice-CowcentratedNoSingleSideAllowed', {
            inputToken: error.inputToken,
            neededToken: error.neededToken,
          })}
        </AlertError>
      );
    }
    if (QuoteCowcentratedNotCalmError.match(error)) {
      return <CalmAlert action={error.action} autoRetry={autoRetry} css={cssProp} />;
    }
    if (QuoteCowcentratedNotActionableError.match(error)) {
      return (
        <NotActionableAlert
          action={error.action}
          actionableAt={error.actionableAt}
          autoRetry={autoRetry}
          css={cssProp}
        />
      );
    }
  }

  return (
    <AlertError css={cssProp}>
      <p>{t(fallbackKey)}</p>
      {error && error.message ?
        <p>{error.message}</p>
      : null}
    </AlertError>
  );
});

const CalmLink = styled(ExternalLink, {
  base: {
    color: 'text.lightest',
    textDecoration: 'underline',
  },
});
