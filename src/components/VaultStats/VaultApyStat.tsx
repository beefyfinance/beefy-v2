import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { memo, useMemo } from 'react';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  formatLargePercent,
  type FormattedTotalApy,
  formatTotalApy,
} from '../../helpers/format.ts';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { selectApyVaultUIData, selectVaultAvgApy } from '../../features/data/selectors/apy.ts';
import { useAppSelector } from '../../store.ts';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';
import {
  getApyComponents,
  getApyLabelsForType,
  getApyLabelsTypeForVault,
} from '../../helpers/apy.ts';
import { useTranslation } from 'react-i18next';
import { selectFilterAvgApySort } from '../../features/data/selectors/filtered-vaults.ts';
import type { AvgApy } from '../../features/data/reducers/apy.ts';
import ExclamationWarning from '../../images/icons/exclamation-warning.svg?react';
import { DivWithTooltip } from '../Tooltip/DivWithTooltip.tsx';
import { styled } from '@repo/styles/jsx';
import { differenceInDays } from 'date-fns';
import { css } from '@repo/styles/css';

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
  const avgApy = useAppSelector(state => selectVaultAvgApy(state, vaultId));

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

  const value =
    data.boosted === 'prestake' ? t('PRE-STAKE')
    : data.boosted === 'active' ? formatted[boostedTotalKey]
    : type === 'daily' ? formatted[totalKey]
    : subSortApy === 'default' ? formatted[totalKey]
    : formatLargePercent(avgApy[subSortApy], 2, '???');

  const subValue =
    isBoosted ?
      type === 'daily' ? formatted[totalKey]
      : subSortApy === 'default' ? formatted[totalKey]
      : formatLargePercent(avgApy[subSortApy], 2, '???')
    : undefined;

  const showAvgApyTooltip = subSortApy !== 'default' && type === 'yearly';

  return (
    <VaultValueStat
      label={label}
      value={
        <Container>
          <DivWithTooltip
            tooltip={
              showAvgApyTooltip ?
                <AvgApyTooltipContent currentApy={formatted[totalKey]} avgApy={avgApy} />
              : <ApyTooltipContent
                  vaultId={vaultId}
                  type={type}
                  isBoosted={isBoosted}
                  rates={formatted}
                />
            }
          >
            {value}
          </DivWithTooltip>
          {showAvgApyTooltip && <AvgApyTooltipWarning isBoosted={isBoosted} vaultId={vaultId} />}
        </Container>
      }
      subValue={subValue}
      blur={false}
      loading={false}
      boosted={isBoosted}
      {...rest}
    />
  );
});

type ApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  isBoosted: boolean;
  rates: FormattedTotalApy;
};

export const ApyTooltipContent = memo(function ApyTooltipContent({
  vaultId,
  type,
  isBoosted,
  rates,
}: ApyTooltipContentProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const rows = useMemo(() => {
    const labels = getApyLabelsForType(getApyLabelsTypeForVault(vault, rates.totalType));
    const allComponents = getApyComponents();
    const components = allComponents[type];
    const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

    const items: {
      label: string | string[];
      value: string;
      last?: boolean;
    }[] = components
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    items.push({
      label: labels[totalKey],
      value: isBoosted ? (rates[boostedTotalKey] ?? '?') : rates[totalKey],
      last: true,
    });

    return items.length ? items : undefined;
  }, [vault, isBoosted, rates, type]);

  return rows ? <InterestTooltipContent rows={rows} /> : undefined;
});

type AvgApyTooltipContentProps = {
  currentApy: string;
  avgApy: AvgApy;
};

export const AvgApyTooltipContent = memo(function AvgApyTooltipContent({
  currentApy,
  avgApy,
}: AvgApyTooltipContentProps) {
  const rows = useMemo(() => {
    const items = [
      {
        label: 'Current APY',
        value: currentApy,
      },
      {
        label: '7 Day Avg APY',
        value: formatLargePercent(avgApy.avg7d, 2, '???'),
      },
      // {
      //   label: '30 Day Avg APY',
      //   value: formatLargePercent(avgApy.avg30d, 2, '???'),
      // },
      // {
      //   label: '90 Day Avg APY',
      //   value: formatLargePercent(avgApy.avg90d, 2, '???'),
      //   last: true,
      // },
    ];

    return items;
  }, [currentApy, avgApy.avg7d]);

  return <InterestTooltipContent highLightLast={false} rows={rows} />;
});

export const AvgApyTooltipWarning = memo(function AvgApyTooltipWarning({
  isBoosted,
  vaultId,
}: {
  isBoosted: boolean;
  vaultId: VaultEntity['id'];
}) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const subSortApy = useAppSelector(selectFilterAvgApySort);
  const vaultCreatedDate = new Date(vault.createdAt * 1000);
  const daysSinceCreation = differenceInDays(new Date(), vaultCreatedDate);

  const shouldShowWarning = useMemo(() => {
    if (subSortApy === 'default' || !vault.createdAt) {
      return false;
    }

    const periodDays = {
      avg7d: 7,
      avg30d: 30,
      avg90d: 90,
    }[subSortApy];

    if (!periodDays) {
      return false;
    }

    return daysSinceCreation < periodDays;
  }, [subSortApy, vault.createdAt, daysSinceCreation]);

  if (!shouldShowWarning) {
    return null;
  }

  return (
    <DivWithTooltip
      tooltip={t('AvgApyTooltip-Warning', {
        daysSince: daysSinceCreation === 0 ? 1 : daysSinceCreation,
        days: daysSinceCreation > 1 ? 'days' : 'day',
      })}
      contentClassName={css({ maxWidth: '285px' })}
    >
      <Warning isBoosted={isBoosted} />
    </DivWithTooltip>
  );
});

const Warning = styled(ExclamationWarning, {
  base: {
    width: ' 12px;',
    height: '12px;',
    color: 'text.middle',
  },
  variants: {
    isBoosted: {
      true: {
        color: 'text.boosted',
      },
    },
  },
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
