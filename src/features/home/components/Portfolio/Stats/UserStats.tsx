import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Visible } from '../../../../../components/MediaQueries/Visible.tsx';
import { VisibleAbove } from '../../../../../components/MediaQueries/VisibleAbove.tsx';
import { formatLargePercent, formatLargeUsd } from '../../../../../helpers/format.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { selectUserGlobalStats } from '../../../../data/selectors/apy.ts';
import { selectIsBalanceHidden } from '../../../../data/selectors/wallet.ts';
import { Stat } from './Stat.tsx';
import { Stats } from './Stats.tsx';

export const UserStats = memo(function UserStats() {
  const stats = useAppSelector(selectUserGlobalStats);
  const hideBalance = useAppSelector(selectIsBalanceHidden);
  const { t } = useTranslation();

  return (
    <Stats>
      <Stat
        label={t('Portfolio-Deposited')}
        value={formatLargeUsd(stats.deposited)}
        blurred={hideBalance}
      />
      <Stat
        label={t('Portfolio-YieldMnth')}
        value={formatLargeUsd(stats.monthly)}
        blurred={hideBalance}
      />
      <Visible from="sm">
        <Stat
          label={t('Portfolio-YieldDay')}
          value={formatLargeUsd(stats.daily)}
          blurred={hideBalance}
        />
      </Visible>
      <VisibleAbove width={430}>
        <Stat
          label={t('Portfolio-AvgAPY')}
          value={formatLargePercent(stats.apy, 2, '0%')}
          blurred={hideBalance}
        />
      </VisibleAbove>
    </Stats>
  );
});
