import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectApyVaultUIData } from '../../features/data/selectors/apy.ts';
import { selectFilterAvgApySort } from '../../features/data/selectors/filtered-vaults.ts';
import { formatAvgApy, formatLargePercent, formatTotalApy } from '../../helpers/format.ts';
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
  ...rest
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
    return <VaultValueStat label={label} value="-" blur={false} loading={true} {...rest} />;
  }

  if (data.status !== 'available' || !formatted) {
    return (
      <VaultValueStat
        label={label}
        value={data.status === 'hidden' ? '-' : '???'}
        blur={false}
        loading={false}
        {...rest}
      />
    );
  }

  const isBoosted = !!data.boosted;
  const averages = data.averages;

  const value =
    data.boosted === 'prestake' ? t('PRE-STAKE')
    : data.boosted === 'active' ? formatted[boostedTotalKey]
    : type === 'daily' ? formatted[totalKey]
    : subSortApy === 'default' || !averages?.periods[subSortApy]?.partial ? formatted[totalKey]
    : formatLargePercent(averages.periods[subSortApy].value, 2, '???');

  const subValue =
    isBoosted ?
      type === 'daily' ? formatted[totalKey]
      : subSortApy === 'default' ? formatted[totalKey]
      : undefined
    : undefined;

  const isAverage = subSortApy !== 'default' && type === 'yearly';
  const isWarning = isAverage && !averages?.periods[subSortApy]?.full;

  return (
    <VaultValueStat
      label={label}
      Icon={isWarning ? ExclaimRoundedSquare : undefined}
      value={value}
      tooltip={
        <ApyTooltipContent
          vaultId={vaultId}
          type={type}
          isBoosted={isBoosted}
          rates={formatted}
          averages={averages && formatAvgApy(averages)}
        />
      }
      subValue={subValue}
      blur={false}
      loading={false}
      boosted={isBoosted}
      {...rest}
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
