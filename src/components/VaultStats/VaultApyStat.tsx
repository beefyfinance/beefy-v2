import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  formatApyUIRate,
  selectApyVaultUIData,
  selectClmDisplayVaultId,
  selectDashboardClmBlendedApy,
  selectDashboardRateVaultId,
  selectDashboardRateVaultIds,
} from '../../features/data/selectors/apy.ts';
import { shallowArrayEqual } from '../../features/data/utils/selector-equality.ts';
import {
  CLM_SIDE_NAME,
  getClmSide,
} from '../../features/vault/components/Actions/Transact/DepositFromVaultSelectList/groups.ts';
import { selectFilterAppliedAvgApySort } from '../../features/data/selectors/filtered-vaults.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { formatAvgApy, formatLargePercent, formatTotalApy } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import InfoRoundedSquare from '../../images/icons/info-rounded-square.svg?react';
import type { VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';
import { ApyTooltipContent } from './ApyTooltipContent.tsx';

export type VaultApyStatProps = Omit<
  VaultValueStatProps,
  'label' | 'tooltip' | 'value' | 'subValue' | 'blur' | 'loading' | 'boosted'
> & {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  /** the dashboard's address, for the tooltip's own-positions line */
  walletAddress?: string;
};

const NO_RATE_IDS: VaultEntity['id'][] = [];

export const VaultApyStat = memo(function VaultApyStat({
  vaultId,
  type,
  walletAddress,
  ...passthrough
}: VaultApyStatProps) {
  // with an address (the dashboard) a CLM row quotes the sides that address holds; elsewhere a
  // merged CLM shows the side selectClmDisplayVaultId picks
  const rateIds = useAppSelector(state =>
    walletAddress ? selectDashboardRateVaultIds(state, vaultId, walletAddress) : NO_RATE_IDS
  );
  const apyVaultId = useAppSelector(state =>
    walletAddress ?
      selectDashboardRateVaultId(state, vaultId, walletAddress)
    : selectClmDisplayVaultId(state, vaultId)
  );

  if (walletAddress && type === 'yearly' && rateIds.length > 1) {
    return (
      <BlendedApyStat
        vaultId={vaultId}
        sideIds={rateIds}
        walletAddress={walletAddress}
        {...passthrough}
      />
    );
  }
  return (
    <SideApyStat
      apyVaultId={apyVaultId}
      type={type}
      walletAddress={walletAddress}
      {...passthrough}
    />
  );
});

type SideApyStatProps = Omit<VaultApyStatProps, 'vaultId'> & { apyVaultId: VaultEntity['id'] };

const SideApyStat = memo(function SideApyStat({
  apyVaultId,
  type,
  walletAddress,
  ...passthrough
}: SideApyStatProps) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectApyVaultUIData(state, apyVaultId));
  const subSortApy = useAppSelector(selectFilterAppliedAvgApySort);

  const label =
    type === 'daily' ? t('VaultStat-DAILY')
    : data.type === 'apr' ? t('VaultStat-APR')
    : subSortApy !== 'default' ? t('VaultStat-AvgAPY', { count: subSortApy })
    : t('VaultStat-APY');
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
      Icon={hasAverageWarning ? InfoRoundedSquare : undefined}
      value={value}
      tooltip={
        <ApyTooltipContent
          vaultId={apyVaultId}
          type={type}
          isBoosted={isBoosted}
          rates={formatted}
          averages={averages}
          walletAddress={walletAddress}
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

type BlendedApyStatProps = Omit<VaultApyStatProps, 'walletAddress' | 'type'> & {
  sideIds: VaultEntity['id'][];
  walletAddress: string;
};

/** a CLM row held on both sides: one rate for the position, each side's own rate in the tooltip */
const BlendedApyStat = memo(function BlendedApyStat({
  vaultId,
  sideIds,
  walletAddress,
  ...passthrough
}: BlendedApyStatProps) {
  const { t } = useTranslation();
  const blended = useAppSelector(state =>
    selectDashboardClmBlendedApy(state, vaultId, walletAddress)
  );
  const sides = useAppSelector(
    state => sideIds.map(id => getClmSide(selectVaultById(state, id))!),
    shallowArrayEqual
  );
  const rates = useAppSelector(
    state => sideIds.map(id => selectApyVaultUIData(state, id)),
    shallowArrayEqual
  );
  const value = blended === undefined ? '???' : formatLargePercent(blended, 2);
  const rows = useMemo(
    () => [
      ...sides.map((side, i) => {
        const rate = formatApyUIRate(rates[i]);
        return {
          label: CLM_SIDE_NAME[side],
          value:
            rate ?
              `${rate.value} ${t(rate.type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY')}`
            : '-',
        };
      }),
      { label: 'Vault-Apy-YourPositions', value },
    ],
    [sides, rates, value, t]
  );

  if (rates.some(data => data.status === 'loading')) {
    return (
      <VaultValueStat
        label={t('VaultStat-APY')}
        value="-"
        blur={false}
        loading={true}
        {...passthrough}
      />
    );
  }
  return (
    <VaultValueStat
      label={t('VaultStat-APY')}
      value={value}
      tooltip={<InterestTooltipContent rows={rows} />}
      blur={false}
      loading={false}
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
