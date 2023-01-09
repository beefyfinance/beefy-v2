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

const useStyles = makeStyles(styles);

export const DepositSummary = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const stats = useAppSelector(selectUserGlobalStats);

  const UserStats = useMemo(() => {
    return [
      {
        title: t('Summary-Deposit'),
        value: formatUsd(stats.deposited),
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Monthly'),
        value: formatUsd(stats.monthly),
        Icon: MonthlyIcon,
      },
      {
        title: t('Summary-Daily'),
        value: formatUsd(stats.daily),
        Icon: DailyIcon,
      },
      {
        title: t('Summary-Vaults'),
        value: `${stats.depositedVaults}`,
        Icon: VaultIcon,
      },
    ];
  }, [stats.daily, stats.deposited, stats.depositedVaults, stats.monthly, t]);

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.title}>{t('Dashboard-Title')}</div>
        <SummaryStats items={UserStats} />
      </Container>
    </div>
  );
});
