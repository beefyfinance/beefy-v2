import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatLargePercent, formatLargeUsd } from '../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectUserGlobalStats } from '../../../../data/selectors/apy.ts';
import { selectIsBalanceHidden } from '../../../../data/selectors/wallet.ts';
import { Stat } from './Stat.tsx';
import { PortfolioStatsContainer } from './Stats.tsx';

export const PortfolioStats = memo(function PortfolioStats() {
  const stats = useAppSelector(selectUserGlobalStats);
  const hideBalance = useAppSelector(selectIsBalanceHidden);
  const { t } = useTranslation();

  return (
    <PortfolioStatsContainer>
      <Stat
        label={t('Portfolio-Deposited')}
        value={formatLargeUsd(stats.deposited)}
        blurred={hideBalance}
      />

      <Stat
        label={t('Portfolio-AvgAPY')}
        value={formatLargePercent(stats.apy, 2, '0%')}
        blurred={hideBalance}
      />

      <Stat
        label={t('Portfolio-EstimatedYield')}
        value={formatLargeUsd(stats.daily)}
        blurred={hideBalance}
      />
    </PortfolioStatsContainer>
  );
});
