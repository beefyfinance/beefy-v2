import type { CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError } from '../../../../../../components/Alerts/Alerts.tsx';
import { ExternalLink } from '../../../../../../components/Links/ExternalLink.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import {
  CrossChainBridgeBelowFeeError,
  QuoteCowcentratedNoSingleSideError,
  QuoteCowcentratedNotCalmError,
} from '../../../../../data/apis/transact/strategies/error.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectCrossChainRecoveryQuoteError,
  selectCrossChainRecoveryQuoteStatus,
} from '../../../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type RecoveryQuoteErrorAlertProps = {
  action: 'deposit' | 'withdraw';
  css?: CssStyles;
};

export const RecoveryQuoteErrorAlert = memo(function RecoveryQuoteErrorAlert({
  action,
  css: cssProp,
}: RecoveryQuoteErrorAlertProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectCrossChainRecoveryQuoteStatus);
  const error = useAppSelector(selectCrossChainRecoveryQuoteError);

  if (status !== TransactStatus.Rejected || !error) {
    return null;
  }

  if (CrossChainBridgeBelowFeeError.match(error)) {
    return (
      <AlertError css={cssProp}>{t(`Transact-Quote-Error-CrossChain-TooLow-${action}`)}</AlertError>
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
    return (
      <AlertError css={cssProp}>
        <Trans
          t={t}
          i18nKey={`Transact-Quote-Error-Calm-${action}`}
          components={{
            LinkCalm: (
              <ExternalLink
                className={classes.link}
                href={'https://docs.beefy.finance/beefy-products/clm#calmness-check'}
              />
            ),
          }}
        />
      </AlertError>
    );
  }

  return (
    <AlertError css={cssProp}>
      <p>{t('Transact-Quote-Error')}</p>
      {error.message ?
        <p>{error.message}</p>
      : null}
    </AlertError>
  );
});
