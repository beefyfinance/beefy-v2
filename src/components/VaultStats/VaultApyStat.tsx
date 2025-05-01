import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectApyVaultUIData } from '../../features/data/selectors/apy.ts';
import { selectFilterAvgApySort } from '../../features/data/selectors/filtered-vaults.ts';
import { formatAvgApy, formatTotalApy } from '../../helpers/format.ts';
import ExclaimRoundedSquare from '../../images/icons/exclaim-rounded-square.svg?react';
import { useAppSelector } from '../../store.ts';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import { ApyTooltipContent } from './ApyTooltipContent.tsx';

export type VaultApyStatProps = Omit<
  VaultValueStatProps,
  'label' | 'tooltip' | 'value' | 'subValue' | 'blur' | 'loading' | 'boosted'
> & {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
};

export const VaultApyStat = memo(function VaultApyStat({
  vaultId,
  type,
  ...passthrough
}: VaultApyStatProps) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectApyVaultUIData(state, vaultId));
  const subSortApy = useAppSelector(selectFilterAvgApySort);

  const label =
    type === 'daily' ? 'VaultStat-DAILY'
    : data.type === 'apr' ? 'VaultStat-APR'
    : 'VaultStat-APY';
  const formatted = useMemo(
    () => (data.status === 'available' ? formatTotalApy(data.values, '???') : undefined),
    [data]
  );
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

  if (data.status === 'loading') {
    return <VaultValueStat label={label} value="-" blur={false} loading={true} {...passthrough} />;
  }

  if (data.status !== 'available' || !formatted) {
    return (
      <VaultValueStat
        label={label}
        value={data.status === 'hidden' ? '-' : '???'}
        blur={false}
        loading={false}
        {...passthrough}
      />
    );
  }

  const isBoosted = !!data.boosted;
  const averages = data.averages ? formatAvgApy(data.averages) : undefined;
  const showAverage = subSortApy !== 'default' && type === 'yearly';
  const hasAverageWarning = showAverage && !averages?.periods[subSortApy]?.full;

  const boostedPercent =
    data.boosted === 'prestake' ? t('PRE-STAKE')
    : data.boosted === 'active' ? formatted[boostedTotalKey]
    : undefined;
  const currentPercent = formatted[totalKey];
  const averagePercent =
    showAverage && averages?.periods[subSortApy]?.partial ?
      averages.periods[subSortApy].formatted
    : undefined;

  const value = boostedPercent ?? averagePercent ?? currentPercent;
  const subValue = isBoosted ? (averagePercent ?? currentPercent) : undefined;

  return (
    <VaultValueStat
      label={label}
      Icon={hasAverageWarning ? ExclaimRoundedSquare : undefined}
      value={value}
      tooltip={
        <ApyTooltipContent
          vaultId={vaultId}
          type={type}
          isBoosted={isBoosted}
          rates={formatted}
          averages={averages}
        />
      }
      subValue={subValue}
      blur={false}
      loading={false}
      boosted={isBoosted}
      {...passthrough}
    />
  );
});

export const Container = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    justifyContent: 'flex-start',
    lg: {
      justifyContent: 'flex-end',
    },
  },
});
