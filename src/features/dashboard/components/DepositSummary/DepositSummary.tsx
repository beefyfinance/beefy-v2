import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLargeUsd } from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../../store.ts';
import { selectUserGlobalStats } from '../../../data/selectors/apy.ts';
import { SummaryStats } from '../../../../components/SummaryStats/SummaryStats.tsx';
import { styles } from './styles.ts';
import WalletIcon from '../../../../images/icons/wallet.svg?react';
import VaultIcon from '../../../../images/icons/vault.svg?react';
import DailyIcon from '../../../../images/icons/daily-yield.svg?react';
import MonthlyIcon from '../../../../images/icons/monthly-yield.svg?react';
import { AddressInput } from '../AddressInput/AddressInput.tsx';
import { ShortAddress } from '../ShortAddress/ShortAddress.tsx';
import { Container } from '../../../../components/Container/Container.tsx';
import { selectUserTotalYieldUsd } from '../../../data/selectors/dashboard.ts';

const useStyles = legacyMakeStyles(styles);

interface DepositSummaryProps {
  address: string;
  addressLabel?: string;
}

export const DepositSummary = memo(function DepositSummary({
  address,
  addressLabel,
}: DepositSummaryProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const stats = useAppSelector(state => selectUserGlobalStats(state, address));
  const totalYieldUsd = useAppSelector(state => selectUserTotalYieldUsd(state, address));

  const UserStats = useMemo(() => {
    return [
      {
        title: t('Summary-Deposit'),
        value: formatLargeUsd(stats.deposited),
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Vaults'),
        value: `${stats.depositedVaults}`,
        Icon: VaultIcon,
      },
      {
        title: t('Summary-Yield'),
        value: formatLargeUsd(totalYieldUsd.toNumber()),
        Icon: MonthlyIcon,
      },
      {
        title: t('Summary-Daily'),
        value: formatLargeUsd(stats.daily),
        Icon: DailyIcon,
      },
    ];
  }, [t, stats.deposited, stats.depositedVaults, stats.daily, totalYieldUsd]);

  return (
    <div className={classes.container}>
      <Container maxWidth="lg">
        <div className={classes.titleContainer}>
          <div className={classes.title}>
            {t('Dashboard-Title')}
            <ShortAddress address={address} addressLabel={addressLabel} />
          </div>
          <div>
            <AddressInput />
          </div>
        </div>
        <SummaryStats items={UserStats} />
      </Container>
    </div>
  );
});
