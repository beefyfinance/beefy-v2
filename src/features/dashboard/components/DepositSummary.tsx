import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryStats } from '../../../components/SummaryStats/SummaryStats.tsx';
import { TextLoader } from '../../../components/TextLoader/TextLoader.tsx';
import { formatLargeUsd } from '../../../helpers/format.ts';
import { useAppSelector } from '../../data/store/hooks.ts';
import { selectUserGlobalStats } from '../../data/selectors/apy.ts';
import { selectUserTotalYieldUsd } from '../../data/selectors/dashboard.ts';

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
        label: t('Summary-Deposit'),
        value: formatLargeUsd(stats.deposited),
      },
      {
        label: t('Summary-Vaults'),
        value: `${stats.depositedVaults}`,
      },
      {
        label: t('Summary-Yield'),
        value: formatLargeUsd(totalYieldUsd.toNumber()),
      },
      {
        label: t('Summary-Daily'),
        value: formatLargeUsd(stats.daily),
      },
    ];
  }, [t, stats.deposited, stats.depositedVaults, stats.daily, totalYieldUsd]);

  return <SummaryStats items={userStats} />;
});

export const DepositSummaryPlaceholder = memo(function DepositSummaryPlaceholder({
  showZeroBalance,
}: {
  showZeroBalance?: boolean;
}) {
  const { t } = useTranslation();
  const userStats = useMemo(() => {
    const loading = <TextLoader placeholder={'Loading...'} />;
    const zeroBalance = <div>{t('Summary-Zero-Balance')}</div>;

    const value = showZeroBalance ? zeroBalance : loading;
    return [
      {
        label: t('Summary-Deposit'),
        value: value,
      },
      {
        label: t('Summary-Vaults'),
        value: value,
      },
      {
        label: t('Summary-Yield'),
        value: value,
      },
      {
        label: t('Summary-Daily'),
        value: value,
      },
    ];
  }, [showZeroBalance, t]);

  return <SummaryStats items={userStats} />;
});
