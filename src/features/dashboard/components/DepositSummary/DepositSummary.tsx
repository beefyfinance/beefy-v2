import { Container, makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { selectUserGlobalStats } from '../../../data/selectors/apy';
import { SummaryStats } from '../../../../components/SummaryStats';
import { styles } from './styles';
import { ReactComponent as WalletIcon } from '../../../../images/icons/wallet.svg';
import { ReactComponent as VaultIcon } from '../../../../images/icons/vault.svg';
import { ReactComponent as DailyIcon } from '../../../../images/icons/daily-yield.svg';
import { ReactComponent as MonthlyIcon } from '../../../../images/icons/monthly-yield.svg';
import { selectUserTotalYieldUsd } from '../../../data/selectors/balance';
import { AddressInput } from '../AddressInput';
import { ShortAddress } from '../ShortAddress';

const useStyles = makeStyles(styles);

export const DepositSummary = memo(function DepositSummary({
  viewAsAddress,
  loading,
  error,
}: {
  viewAsAddress: string;
  loading: boolean;
  error: boolean;
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const stats = useAppSelector(selectUserGlobalStats);

  const totalYieldUsd = useAppSelector(selectUserTotalYieldUsd);

  const shouldShowZero = useMemo(() => {
    return loading || error;
  }, [error, loading]);

  const UserStats = useMemo(() => {
    return [
      {
        title: t('Summary-Deposit'),
        value: formatUsd(shouldShowZero ? 0 : stats.deposited),
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Vaults'),
        value: shouldShowZero ? '0' : `${stats.depositedVaults}`,
        Icon: VaultIcon,
      },
      {
        title: t('Summary-Yield'),
        value: formatUsd(shouldShowZero ? 0 : totalYieldUsd.toNumber()),
        Icon: MonthlyIcon,
      },
      {
        title: t('Summary-Daily'),
        value: formatUsd(shouldShowZero ? 0 : stats.daily),
        Icon: DailyIcon,
      },
    ];
  }, [t, shouldShowZero, stats.deposited, stats.depositedVaults, stats.daily, totalYieldUsd]);

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.titleContainer}>
          <div className={classes.title}>
            {t('Dashboard-Title')}
            <ShortAddress error={error} loading={loading} />
          </div>
          <div>
            <AddressInput viewAsAddress={viewAsAddress} />
          </div>
        </div>
        <SummaryStats items={UserStats} />
      </Container>
    </div>
  );
});
