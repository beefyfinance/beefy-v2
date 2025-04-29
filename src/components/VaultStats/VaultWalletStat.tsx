import { memo } from 'react';
import { connect } from 'react-redux';
import { type VaultEntity } from '../../features/data/entities/vault.ts';
import { selectUserBalanceOfToken } from '../../features/data/selectors/balance.ts';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader.ts';
import {
  selectTokenByAddress,
  selectTokenPriceByAddress,
} from '../../features/data/selectors/tokens.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format.ts';
import type { BeefyState } from '../../redux-types.ts';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';

export type VaultWalletStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultWalletStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultWalletStatProps) {
  const label = 'VaultStat-WALLET';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);
  const walletAddress = selectWalletAddress(state);

  if (!walletAddress) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
    };
  }

  const isLoaded =
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: hideBalance,
      loading: true,
      expectSubValue: true,
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
