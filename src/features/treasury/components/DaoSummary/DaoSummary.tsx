import { Container, makeStyles } from '@material-ui/core';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStats } from '../../../../components/SummaryStats';
import { formatBigUsd } from '../../../../helpers/format';
import { styles } from './styles';
import { ReactComponent as WalletIcon } from '../../../../images/icons/wallet.svg';
import { ReactComponent as VaultIcon } from '../../../../images/icons/vault.svg';
import { ReactComponent as DailyIcon } from '../../../../images/icons/daily-yield.svg';
import { ReactComponent as BifiIcon } from '../../../../images/icons/bifi.svg';
import { useAppSelector } from '../../../../store';
import { selectTreasuryStats } from '../../../data/selectors/treasury';

const useStyles = makeStyles(styles);

export const DaoSummary = memo(function () {
  const { t } = useTranslation();
  const classes = useStyles();

  const { holdings, beefyHeld, assets, stables } = useAppSelector(selectTreasuryStats);

  const DaoStats = useMemo(() => {
    return [
      {
        title: t('Summary-Holdings'),
        value: formatBigUsd(holdings),
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Stables'),
        value: formatBigUsd(stables),
        Icon: DailyIcon,
      },
      {
        title: t('Summary-Held-BIFI'),
        value: beefyHeld.toFixed(0),
        Icon: BifiIcon,
      },
      {
        title: t('Summary-Asset-Diversity'),
        value: `${assets}`,
        Icon: VaultIcon,
      },
    ];
  }, [assets, beefyHeld, holdings, stables, t]);

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.title}>{t('Treasury-Title')}</div>
        <SummaryStats tinnyStyle={true} items={DaoStats} />
      </Container>
    </div>
  );
});
