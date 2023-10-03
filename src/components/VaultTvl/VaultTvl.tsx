import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { VaultEntity } from '../../features/data/entities/vault';
import { selectVaultTvl } from '../../features/data/selectors/tvl';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { formatBigUsd } from '../../helpers/format';
import type { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { BIG_ZERO } from '../../helpers/big-number';
import { selectLpBreakdownByTokenAddress } from '../../features/data/selectors/tokens';
import type { LpData } from '../../features/data/apis/beefy/beefy-api';
import { TvlShareTooltip } from '../VaultStats/VaultTvlStat';
import type { PlatformEntity } from '../../features/data/entities/platform';
import { getVaultUnderlyingTvlAndBeefySharePercent } from '../../helpers/tvl';
import type BigNumber from 'bignumber.js';

const _VaultTvl = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const label = 'VaultStat-TVL';
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    state.ui.dataLoader.byChainId[vault.chainId]?.contractData.alreadyLoadedOnce &&
    state.ui.dataLoader.global.prices.alreadyLoadedOnce;

  if (!isLoaded) {
    return {
      label,
      vaultTvl: BIG_ZERO,
      subValue: null,
      loading: true,
      breakdown: null,
    };
  }
  // deposit can be moo or oracle
  const tvl = selectVaultTvl(state, vaultId);
  const breakdown = selectLpBreakdownByTokenAddress(
    state,
    vault.chainId,
    vault.depositTokenAddress
  );

  if (!breakdown) {
    return {
      label,
      vaultTvl: tvl,
      subValue: null,
      loading: false,
      breakdown: null,
    };
  }

  const { percent, underlyingTvl } = getVaultUnderlyingTvlAndBeefySharePercent(
    breakdown.totalSupply,
    breakdown.price,
    tvl
  );

  return {
    label,
    vaultTvl: tvl,
    underlyingTvl: underlyingTvl,
    loading: !isLoaded,
    percent,
    platformId: vault.platformId,
    breakdown,
  };
})(
  ({
    label,
    vaultTvl,
    loading,
    breakdown,
    underlyingTvl,
    platformId,
    percent,
  }: {
    label: string;
    vaultTvl: BigNumber;
    underlyingTvl: BigNumber;
    loading: boolean;
    percent: number;
    breakdown: LpData;
    platformId: PlatformEntity['id'];
  }) => {
    const { t } = useTranslation();

    const value = useMemo(() => {
      return formatBigUsd(vaultTvl);
    }, [vaultTvl]);

    const subValue = useMemo(() => {
      return breakdown ? formatBigUsd(underlyingTvl) : null;
    }, [breakdown, underlyingTvl]);

    return (
      <ValueBlock
        label={t(label)}
        value={value}
        blurred={false}
        loading={loading}
        usdValue={subValue}
        tooltip={
          breakdown
            ? {
                content: (
                  <TvlShareTooltip
                    platformId={platformId}
                    underlyingTvl={underlyingTvl}
                    vaultTvl={vaultTvl}
                    percent={percent}
                  />
                ),
              }
            : null
        }
      />
    );
  }
);
export const VaultTvl = React.memo(_VaultTvl);
