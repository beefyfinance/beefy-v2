import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { VaultEntity } from '../../features/data/entities/vault';
import { selectWalletBalanceOfToken } from '../../features/data/selectors/balance';
import { selectTokenPriceByTokenId } from '../../features/data/selectors/tokens';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden } from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _VaultWalletAmount = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const userOracleInWallet = selectWalletBalanceOfToken(state, vault.chainId, vault.oracleId);
    const price = selectTokenPriceByTokenId(state, vault.oracleId);
    const userOracleInWalletUsd = userOracleInWallet.multipliedBy(price);

    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce &&
      state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce;
    return {
      hasInWallet: userOracleInWallet.gt(0),
      userOracleInWallet: formatBigDecimals(userOracleInWallet, 4, false),
      userOracleInWalletUsd: formatBigUsd(userOracleInWalletUsd),
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    hasInWallet,
    userOracleInWallet,
    userOracleInWalletUsd,
    blurred,
    loading,
  }: {
    hasInWallet: boolean;
    userOracleInWallet: string;
    userOracleInWalletUsd: string;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('WALLET')}
        value={userOracleInWallet}
        usdValue={hasInWallet ? userOracleInWalletUsd : null}
        blurred={blurred}
        loading={loading}
      />
    );
  }
);
export const VaultWalletAmount = React.memo(_VaultWalletAmount);
