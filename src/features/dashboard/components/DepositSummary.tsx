import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLargeUsd } from '../../../helpers/format.ts';
import { useAppSelector } from '../../../store.ts';
import { selectUserGlobalStats } from '../../data/selectors/apy.ts';
import { SummaryStats } from '../../../components/SummaryStats/SummaryStats.tsx';
import WalletIcon from '../../../images/icons/wallet.svg?react';
import VaultIcon from '../../../images/icons/vault.svg?react';
import DailyIcon from '../../../images/icons/daily-yield.svg?react';
import MonthlyIcon from '../../../images/icons/monthly-yield.svg?react';
import { selectUserTotalYieldUsd } from '../../data/selectors/dashboard.ts';
import { TextLoader } from '../../../components/TextLoader/TextLoader.tsx';
import { css } from '@repo/styles/css';

interface DepositSummaryProps {
  address: string;
}

export const DepositSummary = memo(function DepositSummary({ address }: DepositSummaryProps) {
  const { t } = useTranslation();
  const stats = useAppSelector(state => selectUserGlobalStats(state, address));
  const totalYieldUsd = useAppSelector(state => selectUserTotalYieldUsd(state, address));

  const userStats = useMemo(() => {
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

  return <SummaryStats items={userStats} />;
});

export const DepositSummaryPlaceholder = memo(function DepositSummaryPlaceholder() {
  const { t } = useTranslation();
  const userStats = useMemo(() => {
    const loading = <TextLoader placeholder={'Loading...'} css={css.raw({ textStyle: 'h1' })} />;
    return [
      {
        title: t('Summary-Deposit'),
        value: loading,
        Icon: WalletIcon,
      },
      {
        title: t('Summary-Vaults'),
        value: loading,
        Icon: VaultIcon,
      },
      {
        title: t('Summary-Yield'),
        value: loading,
        Icon: MonthlyIcon,
      },
      {
        title: t('Summary-Daily'),
        value: loading,
        Icon: DailyIcon,
      },
    ];
  }, [t]);

  return <SummaryStats items={userStats} />;
});
