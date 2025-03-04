import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectTvlBreakdownByVaultId } from '../../features/data/selectors/tvl.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import type { BeefyState } from '../../redux-types.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import { TvlShareTooltip } from '../VaultStats/VaultTvlStat.tsx';
import { type BigNumber } from 'bignumber.js';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types.ts';
import {
  selectIsContractDataLoadedOnChain,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader.ts';
import { useAppSelector } from '../../store.ts';

type VaultTvlProps = {
  vaultId: VaultEntity['id'];
};

type VaultTvlData = {
  label: string;
  vaultTvl: BigNumber;
  underlyingTvl: BigNumber | null;
  loading: boolean;
  breakdown: TvlBreakdownUnderlying | null;
};

const selectVaultTvlData = (state: BeefyState, vaultId: VaultEntity['id']): VaultTvlData => {
  const label = 'VaultStat-TVL';
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsPricesAvailable(state) && selectIsContractDataLoadedOnChain(state, vault.chainId);

  if (!isLoaded) {
    return {
      label,
      vaultTvl: BIG_ZERO,
      underlyingTvl: null,
      loading: true,
      breakdown: null,
    };
  }

  const breakdown = selectTvlBreakdownByVaultId(state, vaultId);
  if (!breakdown || !('underlyingTvl' in breakdown)) {
    return {
      label,
      vaultTvl: breakdown.vaultTvl,
      underlyingTvl: null,
      loading: false,
      breakdown: null,
    };
  }

  return {
    label,
    vaultTvl: breakdown.vaultTvl,
    underlyingTvl: breakdown.underlyingTvl,
    loading: !isLoaded,
    breakdown,
  };
};

export const VaultTvl = memo(({ vaultId }: VaultTvlProps) => {
  const { t } = useTranslation();
  const { label, vaultTvl, loading, breakdown, underlyingTvl } = useAppSelector(state =>
    selectVaultTvlData(state, vaultId)
  );

  const value = useMemo(() => {
    return formatLargeUsd(vaultTvl);
  }, [vaultTvl]);

  const subValue = useMemo(() => {
    return breakdown && underlyingTvl ? formatLargeUsd(underlyingTvl) : null;
  }, [breakdown, underlyingTvl]);

  return (
    <ValueBlock
      label={t(label)}
      value={value}
      blurred={false}
      loading={loading}
      usdValue={subValue}
      tooltip={breakdown ? <TvlShareTooltip breakdown={breakdown} /> : undefined}
    />
  );
});
