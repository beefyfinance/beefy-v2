import { memo, useMemo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectIsContractDataLoadedOnChain,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader.ts';
import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types.ts';
import { selectTvlBreakdownByVaultId } from '../../features/data/selectors/tvl.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { formatLargeUsd, formatPercent } from '../../helpers/format.ts';
import type { BeefyState } from '../../redux-types.ts';
import { useAppSelector } from '../../store.ts';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';

export type VaultTvlStatProps = {
  vaultId: VaultEntity['id'];
} & Omit<VaultValueStatProps, keyof ReturnType<typeof selectVaultTvlStat>>;

export const VaultTvlStat = memo(function ({ vaultId, ...rest }: VaultTvlStatProps) {
  // @dev don't do this - temp migration away from connect()
  const statProps = useAppSelector(state => selectVaultTvlStat(state, vaultId));
  return <VaultValueStat {...statProps} {...rest} />;
});

// TODO better selector / hook
function selectVaultTvlStat(state: BeefyState, vaultId: VaultEntity['id']) {
  const label = 'VaultStat-TVL';
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsPricesAvailable(state) && selectIsContractDataLoadedOnChain(state, vault.chainId);

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
      expectSubValue: true,
    };
  }

  const breakdown = selectTvlBreakdownByVaultId(state, vaultId);
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
