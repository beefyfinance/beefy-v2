import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatUsd } from '../../../../helpers/format';
import { useAppSelector } from '../../../../store';
import { selectUserGlobalStats } from '../../../data/selectors/apy';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface ResumeStatProps {
  title: string;
  icon: 'wallet' | 'vault' | 'daily-yield' | 'monthly-yield';
  value: string;
}

const ResumeStat = memo<ResumeStatProps>(function ({ title, icon, value }) {
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

export const ResumeStats = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();
  const stats = useAppSelector(selectUserGlobalStats);
  return (
    <div className={classes.resumeContainer}>
      <ResumeStat
        icon="wallet"
        title={t('Resume-Deposit')}
        value={formatUsd(stats.deposited.toNumber())}
      />
      <ResumeStat
        icon="monthly-yield"
        title={t('Resume-Monthly')}
        value={formatUsd(stats.monthly.toNumber())}
      />
      <ResumeStat
        icon="daily-yield"
        title={t('Resume-Daily')}
        value={formatUsd(stats.daily.toNumber())}
      />
      <ResumeStat icon="vault" title={t('Resume-Vaults')} value={`${stats.depositedVaults}`} />
    </div>
  );
});
