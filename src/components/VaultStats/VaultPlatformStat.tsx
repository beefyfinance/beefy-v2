import { memo } from 'react';
import { connect } from 'react-redux';
import type { VaultEntity } from '../../features/data/entities/vault';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsWalletKnown, selectWalletAddress } from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';
import type { BeefyState } from '../../redux-types';
import {
  selectIsAddressChainDataAvailable,
  selectIsGlobalDataAvailable,
} from '../../features/data/selectors/data-loader';

interface VaultPlatformProps {
  vaultId: VaultEntity['id'];
  className?: string;
}

export const VaultPlatformStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultPlatformProps) {
  const label = 'VaultStat-PLATFORM';
  const walletAddress = selectWalletAddress(state);

  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    selectIsGlobalDataAvailable(state, 'prices') && selectIsWalletKnown(state) && walletAddress
      ? selectIsAddressChainDataAvailable(state, walletAddress, vault.chainId, 'balance')
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
