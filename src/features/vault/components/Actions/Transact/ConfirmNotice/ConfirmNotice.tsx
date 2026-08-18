import { css, type CssStyles } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { errorToString, formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { isTokenAmountEqual } from '../../../../../data/apis/transact/helpers/tokens.ts';
import {
  selectTokenAmountForDisplay,
  selectTransactConfirmChanges,
  selectTransactConfirmError,
  selectTransactConfirmStatus,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import type { QuoteOutputTokenAmountChange } from '../../../../../data/apis/transact/transact-types.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type ConfirmNoticeProps = {
  css?: CssStyles;
};
export const ConfirmNotice = memo(function ConfirmNotice({ css: cssProp }: ConfirmNoticeProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactConfirmStatus);
  const changes = useAppSelector(selectTransactConfirmChanges);
  const error = useAppSelector(selectTransactConfirmError);

  if (status === TransactStatus.Fulfilled && changes.length > 0) {
    return (
      <AlertWarning css={cssProp}>
        <p>{t('Transact-Notice-Confirm')}</p>
        <div className={classes.changes}>
          {changes.map((change, i) => (
            <ChangeRow key={i} change={change} />
          ))}
        </div>
      </AlertWarning>
    );
  }

  if (status === TransactStatus.Rejected) {
    return (
      <AlertError css={cssProp}>
        <p>
          {t('Transact-Notice-Confirm-Error', {
            error: error ? errorToString(error) : 'unknown error',
          })}
        </p>
        <p>{t('Transact-Notice-Confirm-Error-Retry')}</p>
      </AlertError>
    );
  }

  return null;
});

type ChangeRowProps = {
  change: QuoteOutputTokenAmountChange;
};
const ChangeRow = memo(function ChangeRow({ change }: ChangeRowProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  // receipt-token amounts render as their deposit-token equivalent
  const amount = useAppSelector(
    state =>
      selectTokenAmountForDisplay(state, { token: change.token, amount: change.amount }, vaultId),
    isTokenAmountEqual
  );
  const newAmount = useAppSelector(
    state =>
      selectTokenAmountForDisplay(
        state,
        { token: change.token, amount: change.newAmount },
        vaultId
      ),
    isTokenAmountEqual
  );
  const difference = useAppSelector(
    state =>
      selectTokenAmountForDisplay(
        state,
        { token: change.token, amount: change.difference },
        vaultId
      ),
    isTokenAmountEqual
  );
  const token = amount.token;
  const price = useAppSelector(state => selectTokenPriceByTokenOracleId(state, token.oracleId));

  const amountUsd = useMemo(() => amount.amount.multipliedBy(price), [amount, price]);
  const newAmountUsd = useMemo(() => newAmount.amount.multipliedBy(price), [newAmount, price]);
  const differenceUsd = useMemo(() => difference.amount.multipliedBy(price), [difference, price]);

  return (
    <div>
      <Trans
        t={t}
        i18nKey="Transact-Notice-Confirm-Original"
        components={{
          amount: <TokenAmountFromEntity amount={amount.amount} token={token} />,
        }}
      />{' '}
      <span className={classes.usdValue}>{formatLargeUsd(amountUsd)}</span>
      <br />
      <Trans
        t={t}
        i18nKey="Transact-Notice-Confirm-New"
        components={{
          amount: <TokenAmountFromEntity amount={newAmount.amount} token={token} />,
        }}
      />{' '}
      <span className={classes.usdValue}>{`${formatLargeUsd(newAmountUsd)}`}</span>
      <br />
      <Trans
        t={t}
        i18nKey="Transact-Notice-Confirm-Difference"
        components={{
          amount: (
            <TokenAmountFromEntity
              amount={difference.amount}
              token={token}
              css={css.raw(
                difference.amount.gt(BIG_ZERO) && styles.positive,
                difference.amount.lt(BIG_ZERO) && styles.negative
              )}
            />
          ),
        }}
      />{' '}
      <span className={classes.usdValue}>
        {differenceUsd.abs().lt(0.01) ? '<$0.01' : formatLargeUsd(differenceUsd)}
      </span>
    </div>
  );
});
