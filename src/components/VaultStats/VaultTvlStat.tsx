import type { VaultEntity } from '../../features/data/entities/vault';
import { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultValueStat } from '../VaultValueStat';
import { selectVaultTvl } from '../../features/data/selectors/tvl';
import { formatBigUsd, formatSmallPercent } from '../../helpers/format';
import { selectLpBreakdownByTokenAddress } from '../../features/data/selectors/tokens';
import BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../helpers/big-number';
import { InterestTooltipContent } from '../InterestTooltipContent';
import { featureFlag_tvlShare } from '../../features/data/utils/feature-flags';

export type VaultTvlStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultTvlStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultTvlStatProps) {
  const label = 'VaultStat-TVL';
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    state.ui.dataLoader.byChainId[vault.chainId]?.contractData.alreadyLoadedOnce &&
    state.ui.dataLoader.global.prices.alreadyLoadedOnce;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
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
      value: formatBigUsd(tvl),
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  const { price, totalSupply } = breakdown;
  const underlyingTvl = new BigNumber(totalSupply).times(price);
  const percent = underlyingTvl.gt(BIG_ZERO) ? tvl.div(underlyingTvl).toNumber() : 0;
  return {
    label,
    value: formatBigUsd(tvl),
    subValue: featureFlag_tvlShare()
      ? `${formatSmallPercent(percent, 1)} / ${formatBigUsd(underlyingTvl)}`
      : null,
    blur: false,
    loading: false,
    tooltip: <TvlShareTooltip underlyingTvl={underlyingTvl} vaultTvl={tvl} percent={percent} />,
  };
}

type TvlShareTooltipProps = {
  underlyingTvl: BigNumber;
  vaultTvl: BigNumber;
  percent: number;
};

const TvlShareTooltip = memo<TvlShareTooltipProps>(function TvlShareTooltip({
  underlyingTvl,
  vaultTvl,
  percent,
}) {
  const rows = useMemo(() => {
    return [
      {
        label: 'Vault-Breakdown-Tvl-Vault',
        value: formatBigUsd(vaultTvl),
      },
      {
        label: 'Vault-Breakdown-Tvl-Underlying',
        value: formatBigUsd(underlyingTvl),
      },
      {
        label: 'Vault-Breakdown-Tvl-Share',
        value: formatSmallPercent(percent),
      },
    ];
  }, [underlyingTvl, vaultTvl, percent]);

  return <InterestTooltipContent rows={rows} />;
});
