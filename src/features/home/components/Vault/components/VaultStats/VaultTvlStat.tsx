import { VaultEntity } from '../../../../../data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { VaultValueStat } from '../VaultValueStat';
import { selectVaultTvl } from '../../../../../data/selectors/tvl';
import { formatBigUsd } from '../../../../../../helpers/format';

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
  return {
    label,
    value: formatBigUsd(tvl),
    subValue: null,
    blur: false,
    loading: false,
  };
}
