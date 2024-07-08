import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { type VaultEntity } from '../../features/data/entities/vault';
import { selectTvlBreakdownByVaultId } from '../../features/data/selectors/tvl';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { formatLargeUsd } from '../../helpers/format';
import type { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { BIG_ZERO } from '../../helpers/big-number';
import { TvlShareTooltip } from '../VaultStats/VaultTvlStat';
import type BigNumber from 'bignumber.js';
import type { TvlBreakdownUnderlying } from '../../features/data/selectors/tvl-types';
import {
  selectIsContractDataLoadedOnChain,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader';

const _VaultTvl = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const label = 'VaultStat-TVL';
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsPricesAvailable(state) && selectIsContractDataLoadedOnChain(state, vault.chainId);

  if (!isLoaded) {
    return {
      label,
      vaultTvl: BIG_ZERO,
      subValue: null,
      loading: true,
      breakdown: null,
    };
  }

  const breakdown = selectTvlBreakdownByVaultId(state, vaultId);
  if (!breakdown || !('underlyingTvl' in breakdown)) {
    return {
      label,
      vaultTvl: breakdown.vaultTvl,
      subValue: null,
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
})(
  ({
    label,
    vaultTvl,
    loading,
    breakdown,
    underlyingTvl,
  }: {
    label: string;
    vaultTvl: BigNumber;
    underlyingTvl: BigNumber;
    loading: boolean;
    breakdown: TvlBreakdownUnderlying;
  }) => {
    const { t } = useTranslation();

    const value = useMemo(() => {
      return formatLargeUsd(vaultTvl);
    }, [vaultTvl]);

    const subValue = useMemo(() => {
      return breakdown ? formatLargeUsd(underlyingTvl) : null;
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
  }
);
export const VaultTvl = React.memo(_VaultTvl);
