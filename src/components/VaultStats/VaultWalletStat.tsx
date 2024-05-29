import type { VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectUserBalanceOfToken } from '../../features/data/selectors/balance';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import {
  selectIsBalanceHidden,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../features/data/selectors/tokens';

export type VaultWalletStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultWalletStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultWalletStatProps) {
  const label = 'VaultStat-WALLET';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);
  const walletAddress = selectWalletAddress(state);
  const isLoaded =
    state.ui.dataLoader.global.prices.lastFulfilled !== undefined &&
    selectIsWalletKnown(state) &&
    walletAddress
      ? state.ui.dataLoader.byAddress[walletAddress]?.byChainId[vault.chainId]?.balance
          .lastFulfilled !== undefined
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
  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalInWallet = formatTokenDisplayCondensed(tokensInWallet, depositToken.decimals, 6);
  const totalInWalletUsd = formatLargeUsd(tokensInWallet.times(price));

  return {
    label,
    value: totalInWallet,
    subValue: totalInWalletUsd,
    blur: hideBalance,
    loading: false,
  };
}
