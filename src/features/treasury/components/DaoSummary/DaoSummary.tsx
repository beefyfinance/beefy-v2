import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStats } from '../../../../components/SummaryStats/SummaryStats.tsx';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { styles } from './styles.ts';
import WalletIcon from '../../../../images/icons/wallet.svg?react';
import VaultIcon from '../../../../images/icons/vault.svg?react';
import DailyIcon from '../../../../images/icons/daily-yield.svg?react';
import BifiIcon from '../../../../images/icons/bifi.svg?react';
import { useAppSelector } from '../../../../store.ts';
import { selectTreasuryStats } from '../../../data/selectors/treasury.ts';
import { Container } from '../../../../components/Container/Container.tsx';

const useStyles = legacyMakeStyles(styles);

export const DaoSummary = memo(function DaoSummary() {
  const { t } = useTranslation();
  const classes = useStyles();

  const { holdings, beefyHeld, assets, stables } = useAppSelector(selectTreasuryStats);

  const DaoStats = useMemo(() => {
    return [
      {
        title: t('Summary-Holdings'),
        value: formatLargeUsd(holdings),
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Stables'),
        value: formatLargeUsd(stables),
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
        <SummaryStats items={DaoStats} />
      </Container>
    </div>
  );
});
