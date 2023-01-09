import React, { memo, useEffect } from 'react';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts';
import { Trans, useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import {
  selectTransactConfirmChanges,
  selectTransactConfirmError,
  selectTransactConfirmStatus,
} from '../../../../../data/selectors/transact';
import { errorToString } from '../../../../../../helpers/format';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';

const useStyles = makeStyles(styles);

export type ConfirmNoticeProps = {
  onChange: (shouldDisable: boolean) => void;
  className?: string;
};
export const ConfirmNotice = memo<ConfirmNoticeProps>(function ({ className, onChange }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const status = useAppSelector(selectTransactConfirmStatus);
  const changes = useAppSelector(selectTransactConfirmChanges);
  const error = useAppSelector(selectTransactConfirmError);

  useEffect(() => {
    onChange(status === TransactStatus.Rejected || status === TransactStatus.Pending);
  }, [status, onChange]);

  if (status === TransactStatus.Fulfilled && changes.length > 0) {
    return (
      <AlertWarning className={className}>
        <p>{t('Transact-Notice-Confirm')}</p>
        <div className={classes.changes}>
          {changes.map((change, i) => (
            <div key={i}>
              <Trans
                t={t}
                i18nKey="Transact-Notice-Confirm-Original"
                components={{
                  amount: <TokenAmountFromEntity amount={change.amount} token={change.token} />,
                }}
              />
              <br />
              <Trans
                t={t}
                i18nKey="Transact-Notice-Confirm-New"
                components={{
                  amount: <TokenAmountFromEntity amount={change.newAmount} token={change.token} />,
                }}
              />
              <br />
              <Trans
                t={t}
                i18nKey="Transact-Notice-Confirm-Difference"
                values={{
                  token: change.token.symbol,
                }}
                components={{
                  amount: (
                    <TokenAmountFromEntity
                      amount={change.difference}
                      token={change.token}
                      className={clsx({
                        [classes.positive]: change.difference.gt(BIG_ZERO),
                        [classes.negative]: change.difference.lt(BIG_ZERO),
                      })}
                    />
                  ),
                }}
              />
            </div>
          ))}
        </div>
      </AlertWarning>
    );
  }

  if (status === TransactStatus.Rejected) {
    return (
      <AlertError className={className}>
        {t('Transact-Notice-Confirm-Error', { error: errorToString(error) })}
      </AlertError>
    );
  }

  return null;
});
