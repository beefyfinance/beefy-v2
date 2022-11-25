import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { selectUserGlobalStats } from '../../../data/selectors/apy';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface SummaryStatProps {
  title: string;
  icon: 'wallet' | 'vault' | 'daily-yield' | 'monthly-yield';
  value: string;
}

const SummaryStat = memo<SummaryStatProps>(function ({ title, icon, value }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.iconContainer}>
        <img
          className={classes.icon}
          src={require(`../../../../images/icons/${icon}.svg`).default}
          alt="icon"
        />
      </div>
      <div className={classes.contentContainer}>
        <div className={classes.title}>{title}</div>
        <div className={classes.value}>{value}</div>
      </div>
    </div>
  );
});

export const SummaryStats = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const stats = useAppSelector(selectUserGlobalStats);
  return (
    <div className={classes.summaryContainer}>
      <SummaryStat icon="wallet" title={t('Summary-Deposit')} value={formatUsd(stats.deposited)} />
      <SummaryStat
        icon="monthly-yield"
        title={t('Summary-Monthly')}
        value={formatUsd(stats.monthly)}
      />
      <SummaryStat icon="daily-yield" title={t('Summary-Daily')} value={formatUsd(stats.daily)} />
      <SummaryStat icon="vault" title={t('Summary-Vaults')} value={`${stats.depositedVaults}`} />
    </div>
  );
});
