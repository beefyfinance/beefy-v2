import { createSelector } from '@reduxjs/toolkit';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectIsContractDataLoadedOnChain } from '../../features/data/selectors/contract-data.ts';
import { selectIsPricesAvailable } from '../../features/data/selectors/prices.ts';
import { selectTvlBreakdownByVaultId } from '../../features/data/selectors/tvl.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import { TvlShareTooltip } from '../VaultStats/VaultTvlStat.tsx';

type VaultTvlProps = {
  vaultId: VaultEntity['id'];
};

const selectVaultTvlData = createSelector(
  [
    selectIsPricesAvailable,
    (state: BeefyState, vaultId: VaultEntity['id']) => {
      const vault = selectVaultById(state, vaultId);
      return selectIsContractDataLoadedOnChain(state, vault.chainId);
    },
    selectTvlBreakdownByVaultId,
  ],
  (isPricesAvailable, isContractDataLoadedOnChain, breakdown) => {
    const label = 'VaultStat-TVL';
    const isLoaded = isPricesAvailable && isContractDataLoadedOnChain;

    if (!isLoaded) {
      return {
        label,
        vaultTvl: BIG_ZERO,
        underlyingTvl: null,
        loading: true,
        breakdown: null,
      };
    }

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
  }
);

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
