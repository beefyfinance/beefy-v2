import type BigNumber from 'bignumber.js';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectIsContractDataLoadedOnChain } from '../../features/data/selectors/data-loader/contract-data.ts';
import { selectIsPricesAvailable } from '../../features/data/selectors/data-loader/prices.ts';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types.ts';
import {
  selectTvlBreakdownByVaultId,
  tvlBreakdownEqual,
} from '../../features/data/selectors/tvl.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { bigNumberEqual } from '../../features/data/utils/selector-equality.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import { TvlShareTooltip } from '../VaultStats/VaultTvlStat.tsx';

type VaultTvlProps = {
  vaultId: VaultEntity['id'];
};

type VaultTvlData = {
  vaultTvl: BigNumber;
  underlyingTvl: BigNumber | null;
  loading: boolean;
  breakdown: TvlBreakdownUnderlying | null;
};

const LOADING_TVL_DATA: VaultTvlData = {
  vaultTvl: BIG_ZERO,
  underlyingTvl: null,
  loading: true,
  breakdown: null,
};

const selectVaultTvlData = (state: BeefyState, vaultId: VaultEntity['id']): VaultTvlData => {
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsPricesAvailable(state) && selectIsContractDataLoadedOnChain(state, vault.chainId);

  if (!isLoaded) {
    return LOADING_TVL_DATA;
  }

  const breakdown = selectTvlBreakdownByVaultId(state, vaultId);
  if (!('underlyingTvl' in breakdown)) {
    return {
      vaultTvl: breakdown.vaultTvl,
      underlyingTvl: null,
      loading: false,
      breakdown: null,
    };
  }

  return {
    vaultTvl: breakdown.vaultTvl,
    underlyingTvl: breakdown.underlyingTvl,
    loading: false,
    breakdown,
  };
};

function optionalBigNumberEqual(a: BigNumber | null, b: BigNumber | null): boolean {
  return a === b || (!!a && !!b && bigNumberEqual(a, b));
}

function vaultTvlDataEqual(a: VaultTvlData, b: VaultTvlData): boolean {
  return (
    a === b ||
    (a.loading === b.loading &&
      bigNumberEqual(a.vaultTvl, b.vaultTvl) &&
      optionalBigNumberEqual(a.underlyingTvl, b.underlyingTvl) &&
      tvlBreakdownEqual(a.breakdown, b.breakdown))
  );
}

export const VaultTvl = memo(({ vaultId }: VaultTvlProps) => {
  const { t } = useTranslation();
  const { vaultTvl, loading, breakdown, underlyingTvl } = useAppSelector(
    state => selectVaultTvlData(state, vaultId),
    vaultTvlDataEqual
  );

  const value = useMemo(() => {
    return formatLargeUsd(vaultTvl);
  }, [vaultTvl]);

  const subValue = useMemo(() => {
    return breakdown && underlyingTvl ? formatLargeUsd(underlyingTvl) : null;
  }, [breakdown, underlyingTvl]);

  return (
    <ValueBlock
      label={t('VaultStat-TVL')}
      value={value}
      blurred={false}
      loading={loading}
      usdValue={subValue}
      tooltip={breakdown ? <TvlShareTooltip breakdown={breakdown} /> : undefined}
    />
  );
});
