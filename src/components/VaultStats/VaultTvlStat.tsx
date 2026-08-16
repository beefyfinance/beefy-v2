import { memo, useMemo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types.ts';
import { selectVaultTvlStatData } from '../../features/data/selectors/vault-stats.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargeUsd, formatPercent } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { type ClmFamilySide, ClmFamilySideLine } from './ClmFamilyShared.tsx';
import { useTranslation } from 'react-i18next';

export type VaultTvlStatProps = {
  vaultId: VaultEntity['id'];
  clmSide?: ClmFamilySide;
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultTvlStat>>;

export const VaultTvlStat = memo(function ({
  vaultId,
  clmSide,
  ...passthrough
}: VaultTvlStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, value, ...statProps } = useAppSelector(state =>
    selectVaultTvlStat(state, vaultId)
  );
  return (
    <VaultValueStat
      label={t(label)}
      value={
        clmSide && !statProps.loading ?
          <ClmFamilySideLine side={clmSide}>{value}</ClmFamilySideLine>
        : value
      }
      {...statProps}
      {...passthrough}
    />
  );
});

function selectVaultTvlStat(state: BeefyState, vaultId: VaultEntity['id']) {
  const label = 'VaultStat-TVL';
  const data = selectVaultTvlStatData(state, vaultId);

  if (data.loading) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
      expectSubValue: true,
    };
  }

  const breakdown = data.breakdown;
  if (!breakdown || !('underlyingTvl' in breakdown)) {
    return {
      label,
      value: formatLargeUsd(breakdown.vaultTvl),
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  return {
    label,
    value: formatLargeUsd(breakdown.vaultTvl),
    subValue: formatLargeUsd(breakdown.underlyingTvl),
    blur: false,
    loading: false,
    tooltip: <TvlShareTooltip breakdown={breakdown} />,
  };
}

type TvlShareTooltipProps = {
  breakdown: TvlBreakdownUnderlying;
};

export const TvlShareTooltip = memo(function TvlShareTooltip({ breakdown }: TvlShareTooltipProps) {
  const platform = useAppSelector(state =>
    breakdown.underlyingPlatformId ?
      selectPlatformById(state, breakdown.underlyingPlatformId)
    : undefined
  );

  const rows = useMemo(() => {
    const platformName = platform?.name || 'Underlying';
    if ('vaultType' in breakdown) {
      return [
        {
          label: [`Vault-Breakdown-Tvl-Vault-${breakdown.vaultType}`, 'Vault-Breakdown-Tvl-Vault'],
          value: formatLargeUsd(breakdown.vaultTvl),
        },
        {
          label: [`Vault-Breakdown-Tvl-Total-${breakdown.totalType}`, 'Vault-Breakdown-Tvl-Total'],
          value: formatLargeUsd(breakdown.totalTvl),
        },
        {
          label: 'Vault-Breakdown-Tvl-Underlying',
          value: formatLargeUsd(breakdown.underlyingTvl),
          labelTextParams: { platform: platformName },
        },
        {
          label: [`Vault-Breakdown-Tvl-Share-${breakdown.totalType}`, 'Vault-Breakdown-Tvl-Share'],
          value: formatPercent(breakdown.totalShare),
        },
      ];
    }

    return [
      {
        label: 'Vault-Breakdown-Tvl-Vault',
        value: formatLargeUsd(breakdown.vaultTvl),
      },
      {
        label: 'Vault-Breakdown-Tvl-Underlying',
        value: formatLargeUsd(breakdown.underlyingTvl),
        labelTextParams: { platform: platformName },
      },
      {
        label: 'Vault-Breakdown-Tvl-Share',
        value: formatPercent(breakdown.vaultShare),
      },
    ];
  }, [breakdown, platform]);

  return <InterestTooltipContent rows={rows} />;
});
