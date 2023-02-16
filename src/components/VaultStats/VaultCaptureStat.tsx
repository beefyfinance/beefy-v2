import { VaultEntity } from '../../features/data/entities/vault';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';
import { selectLpBreakdownByAddress } from '../../features/data/selectors/tokens';
import BigNumber from 'bignumber.js';
import { formatBigUsd, formatSmallPercent } from '../../helpers/format';
import { selectVaultTvl } from '../../features/data/selectors/tvl';
import { BIG_ZERO } from '../../helpers/big-number';

export type VaultSafetyStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultCaptureStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultSafetyStatProps) {
  const label = 'Capture';
  const vault = selectVaultById(state, vaultId);
  const tvl = selectVaultTvl(state, vaultId);
  const breakdown = selectLpBreakdownByAddress(state, vault.chainId, vault.depositTokenAddress);

  if (!breakdown || !tvl) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  const { price, totalSupply } = breakdown;
  const poolTvl = new BigNumber(totalSupply).times(price);
  const percent = poolTvl.gt(BIG_ZERO) ? tvl.div(poolTvl).toNumber() : null;

  return {
    label,
    value: formatBigUsd(poolTvl),
    subValue: percent === null ? '-' : formatSmallPercent(percent, 2),
    blur: false,
    loading: false,
  };
}
