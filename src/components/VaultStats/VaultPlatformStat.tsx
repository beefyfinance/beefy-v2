import { memo } from 'react';
import { connect } from 'react-redux';
import { VaultEntity } from '../../features/data/entities/vault';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';
import { BeefyState } from '../../redux-types';

interface VaultPlatformProps {
  vaultId: VaultEntity['id'];
  className?: string;
}

export const VaultPlatformStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultPlatformProps) {
  const label = 'VaultStat-PLATFORM';

  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
      ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
      : true;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
      className: className ?? '',
    };
  }

  return {
    label,
    value: vault.platformId.toUpperCase(),
    subValue: null,
    blur: false,
    loading: false,
    className: className ?? '',
  };
}
