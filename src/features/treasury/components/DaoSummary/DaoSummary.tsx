import { Container, makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStats } from '../../../../components/SummaryStats';
import { formatUsd } from '../../../../helpers/format';
import { styles } from './styles';
import { ReactComponent as WalletIcon } from '../../../../images/icons/wallet.svg';
import { ReactComponent as VaultIcon } from '../../../../images/icons/vault.svg';
import { ReactComponent as DailyIcon } from '../../../../images/icons/daily-yield.svg';
import { ReactComponent as BifiIcon } from '../../../../images/icons/bifi.svg';

const useStyles = makeStyles(styles);

export const DaoSummary = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const DaoStats = useMemo(() => {
    return [
      {
        title: t('Summary-Holdings'),
        value: formatUsd(15),
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Monthly-Inflow'),
        value: formatUsd(2000),
        Icon: DailyIcon,
      },
      {
        title: t('Summary-Held-BIFI'),
        value: formatUsd(5000),
        Icon: BifiIcon,
      },
      {
        title: t('Summary-Asset-Diversity'),
        value: `48`,
        Icon: VaultIcon,
      },
    ];
  }, [t]);

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.title}>{t('Treasury-Title')}</div>
        <SummaryStats items={DaoStats} />
      </Container>
    </div>
  );
});
