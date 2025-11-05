import { memo, useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { formatLargePercent, formatLargeUsd } from '../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectUserGlobalStats } from '../../../../data/selectors/apy.ts';
import { selectIsBalanceHidden } from '../../../../data/selectors/wallet.ts';
import { Stat } from './Stat.tsx';
import { PortfolioStatsContainer } from './Stats.tsx';
import { styled } from '@repo/styles/jsx';

type YieldStats = {
  daily: number;
  weekly: number;
  monthly: number;
};

export const PortfolioStats = memo(function PortfolioStats() {
  const { deposited, daily, weekly, monthly, apy } = useAppSelector(selectUserGlobalStats);
  const hideBalance = useAppSelector(selectIsBalanceHidden);
  const { t } = useTranslation();

  const yieldStats = {
    daily,
    weekly,
    monthly,
  };

  return (
    <PortfolioStatsContainer>
      <Stat
        label={t('Portfolio-Deposited')}
        value={formatLargeUsd(deposited)}
        blurred={hideBalance}
      />

      <Stat
        label={t('Portfolio-AvgAPY')}
        value={formatLargePercent(apy, 2, '0%')}
        blurred={hideBalance}
      />

      <EstimatedYieldStat yieldStats={yieldStats} blurred={hideBalance} />
    </PortfolioStatsContainer>
  );
});

const variants = ['daily', 'weekly', 'monthly'];

const EstimatedYieldStat = memo(function EstimatedYieldStat({
  yieldStats,
  blurred,
}: {
  blurred: boolean;
  yieldStats: YieldStats;
}) {
  const [index, setIndex] = useState(0);

  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    const nextIndex = (index + 1) % variants.length;
    setIndex(nextIndex);
  }, [index]);

  return (
    <Stat
      label={
        <Trans
          t={t}
          i18nKey={`Portfolio-EstimatedYield`}
          values={{ stat: variants[index] }}
          components={{
            Stat: <SwitchButton index={index} onClick={handleClick} />,
          }}
        />
      }
      value={formatLargeUsd(yieldStats[variants[index] as keyof YieldStats])}
      blurred={blurred}
    />
  );
});

const SwitchButton = memo(function SwitchButton({
  index,
  onClick,
}: {
  index: number;
  onClick: () => void;
}) {
  return <StyledSwitchButton onClick={onClick}>{variants[index]}</StyledSwitchButton>;
});

const StyledSwitchButton = styled('button', {
  base: {
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    textStyle: 'subline.sm.semiBold',
    color: 'text.dark',
    textDecoration: 'underline',
  },
});
