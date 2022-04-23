import { VaultEntity } from '../../../../../data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import { formatBigDecimals, formatBigUsd } from '../../../../../../helpers/format';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';
import { selectTokenPriceByTokenId } from '../../../../../data/selectors/tokens';

export type VaultWalletStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultWalletStat = memo<VaultWalletStatProps>(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultWalletStatProps) {
  const label = 'WALLET';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);
  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletConnected(state)
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
  const tokensInWallet = selectUserBalanceOfToken(state, vault.chainId, vault.oracleId);

  if (!tokensInWallet.gt(0)) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
    };
  }

  const price = selectTokenPriceByTokenId(state, vault.oracleId);
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
