import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { VaultEntity } from '../../features/data/entities/vault';
import { selectUserBalanceOfToken } from '../../features/data/selectors/balance';
import { selectTokenPriceByTokenId } from '../../features/data/selectors/tokens';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _VaultWalletAmount = connect(
  (
    state: BeefyState,
    { vaultId, variant }: { vaultId: VaultEntity['id']; variant: 'small' | 'large' }
  ) => {
    const vault = selectVaultById(state, vaultId);
    const userOracleInWallet = selectUserBalanceOfToken(state, vault.chainId, vault.oracleId);
    const price = selectTokenPriceByTokenId(state, vault.oracleId);
    const userOracleInWalletUsd = userOracleInWallet.multipliedBy(price);

    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletConnected(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
      hasInWallet: userOracleInWallet.gt(0),
      userOracleInWallet: formatBigDecimals(userOracleInWallet, 4, variant === 'small'),
      userOracleInWalletUsd: formatBigUsd(userOracleInWalletUsd),
      blurred,
      loading: !isLoaded,
      variant,
    };
  }
)(
  ({
    hasInWallet,
    userOracleInWallet,
    userOracleInWalletUsd,
    blurred,
    loading,
    variant,
  }: {
    hasInWallet: boolean;
    userOracleInWallet: string;
    userOracleInWalletUsd: string;
    blurred: boolean;
    loading: boolean;
    variant: 'small' | 'large';
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('WALLET')}
        value={userOracleInWallet}
        usdValue={hasInWallet ? userOracleInWalletUsd : null}
        blurred={blurred}
        loading={loading}
        variant={variant}
      />
    );
  }
);
export const VaultWalletAmount = React.memo(_VaultWalletAmount);
