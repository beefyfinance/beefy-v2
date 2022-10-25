import { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectUserBalanceOfToken } from '../../features/data/selectors/balance';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';
import { selectTokenPriceByAddress } from '../../features/data/selectors/tokens';

export type VaultWalletStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultWalletStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultWalletStatProps) {
  const label = 'VaultStat-WALLET';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);
  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
      ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
      : true;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: hideBalance,
      loading: true,
    };
  }
  const tokensInWallet = selectUserBalanceOfToken(state, vault.chainId, vault.depositTokenAddress);

  if (!tokensInWallet.gt(0)) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
    };
  }

  const price = selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalInWallet = formatBigDecimals(tokensInWallet, 4);
  const totalInWalletUsd = formatBigUsd(tokensInWallet.times(price));

  return {
    label,
    value: totalInWallet,
    subValue: totalInWalletUsd,
    blur: hideBalance,
    loading: false,
  };
}
