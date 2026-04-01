import { css, type CssStyles } from '@repo/styles/css';
import { memo, useEffect, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { errorToString, formatLargeUsd } from '../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectTransactConfirmChanges,
  selectTransactConfirmError,
  selectTransactConfirmStatus,
} from '../../../../../data/selectors/transact.ts';
import type { QuoteOutputTokenAmountChange } from '../../../../../data/apis/transact/transact-types.ts';
import { selectTokenPriceByTokenOracleId } from '../../../../../data/selectors/tokens.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export type ConfirmNoticeProps = {
  onChange: (shouldDisable: boolean) => void;
  css?: CssStyles;
};
export const ConfirmNotice = memo(function ConfirmNotice({
  css: cssProp,
  onChange,
}: ConfirmNoticeProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactConfirmStatus);
  const changes = useAppSelector(selectTransactConfirmChanges);
  const error = useAppSelector(selectTransactConfirmError);

  useEffect(() => {
    const shouldDisable = status === TransactStatus.Rejected || status === TransactStatus.Pending;
    onChange(shouldDisable);
  }, [status, changes, onChange]);

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
  const price = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, change.token.oracleId)
  );

  const amountUsd = useMemo(() => change.amount.multipliedBy(price), [change.amount, price]);
  const newAmountUsd = useMemo(
    () => change.newAmount.multipliedBy(price),
    [change.newAmount, price]
  );
  const differenceUsd = useMemo(
    () => change.difference.multipliedBy(price),
    [change.difference, price]
  );

  return (
    <div>
      <Trans
        t={t}
        i18nKey="Transact-Notice-Confirm-Original"
        components={{
          amount: <TokenAmountFromEntity amount={change.amount} token={change.token} />,
        }}
      />{' '}
      <span className={classes.usdValue}>{formatLargeUsd(amountUsd)}</span>
      <br />
      <Trans
        t={t}
        i18nKey="Transact-Notice-Confirm-New"
        components={{
          amount: <TokenAmountFromEntity amount={change.newAmount} token={change.token} />,
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
              amount={change.difference}
              token={change.token}
              css={css.raw(
                change.difference.gt(BIG_ZERO) && styles.positive,
                change.difference.lt(BIG_ZERO) && styles.negative
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
