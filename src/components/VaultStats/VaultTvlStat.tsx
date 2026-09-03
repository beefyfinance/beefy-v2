import { memo, useMemo } from 'react';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectIsContractDataLoadedOnChain } from '../../features/data/selectors/data-loader/contract-data.ts';
import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import { selectIsPricesAvailable } from '../../features/data/selectors/data-loader/prices.ts';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types.ts';
import {
  selectTvlBreakdownByVaultId,
  tvlBreakdownEqual,
} from '../../features/data/selectors/tvl.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargeUsd, formatPercent } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat/VaultValueStat.tsx';
import { useTranslation } from 'react-i18next';

type VaultTvlStatResult = {
  label: string;
  value: string;
  subValue: string | null;
  blur: boolean;
  loading: boolean;
  expectSubValue: boolean;
  tvlBreakdown: TvlBreakdownUnderlying | undefined;
};

export type VaultTvlStatProps = {
  vaultId: VaultEntity['id'];
} & Omit<VaultValueStatProps, keyof VaultTvlStatResult>;

export const VaultTvlStat = memo(function ({ vaultId, ...passthrough }: VaultTvlStatProps) {
  const { t } = useTranslation();
  // @dev don't do this - temp migration away from connect()
  const { label, tvlBreakdown, ...statProps } = useAppSelector(
    state => selectVaultTvlStat(state, vaultId),
    vaultTvlStatEqual
  );
  return (
    <VaultValueStat
      label={t(label)}
      tooltip={tvlBreakdown ? <TvlShareTooltip breakdown={tvlBreakdown} /> : undefined}
      {...statProps}
      {...passthrough}
    />
  );
});

const LOADING_TVL_STAT: VaultTvlStatResult = {
  label: 'VaultStat-TVL',
  value: '-',
  subValue: null,
  blur: false,
  loading: true,
  expectSubValue: true,
  tvlBreakdown: undefined,
};

// the tooltip element is built in the component: JSX in a selector is a fresh object every
// call, so it can never be memoized
const selectVaultTvlStat = (state: BeefyState, vaultId: VaultEntity['id']): VaultTvlStatResult => {
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsPricesAvailable(state) && selectIsContractDataLoadedOnChain(state, vault.chainId);

  if (!isLoaded) {
    return LOADING_TVL_STAT;
  }

  const breakdown = selectTvlBreakdownByVaultId(state, vaultId);
  if (!('underlyingTvl' in breakdown)) {
    return {
      label: 'VaultStat-TVL',
      value: formatLargeUsd(breakdown.vaultTvl),
      subValue: null,
      blur: false,
      loading: false,
      expectSubValue: false,
      tvlBreakdown: undefined,
    };
  }

  return {
    label: 'VaultStat-TVL',
    value: formatLargeUsd(breakdown.vaultTvl),
    subValue: formatLargeUsd(breakdown.underlyingTvl),
    blur: false,
    loading: false,
    expectSubValue: false,
    tvlBreakdown: breakdown,
  };
};

function vaultTvlStatEqual(a: VaultTvlStatResult, b: VaultTvlStatResult): boolean {
  return (
    a === b ||
    (a.label === b.label &&
      a.value === b.value &&
      a.subValue === b.subValue &&
      a.blur === b.blur &&
      a.loading === b.loading &&
      a.expectSubValue === b.expectSubValue &&
      tvlBreakdownEqual(a.tvlBreakdown, b.tvlBreakdown))
  );
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
