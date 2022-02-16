import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { VaultEntity } from '../../features/data/entities/vault';
import {
  selectHasUserDepositInVault,
  selectUserVaultDepositInToken,
  selectUserVaultDepositInUsd,
} from '../../features/data/selectors/balance';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
} from '../../features/data/selectors/boosts';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _VaultDeposited = connect(
  (
    state: BeefyState,
    { vaultId, variant }: { vaultId: VaultEntity['id']; variant: 'small' | 'large' }
  ) => {
    const vault = selectVaultById(state, vaultId);
    const isBoosted = selectIsVaultBoosted(state, vault.id);
    const stakedIds = selectActiveVaultBoostIds(state, vault.id)
      .map(boostId => {
        const boost = selectBoostById(state, boostId);
        return boost.name;
      })
      .join(', ');
    const userStaked = selectHasUserDepositInVault(state, vault.id);
    const deposit = selectUserVaultDepositInToken(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const totalDeposited = deposit.isZero() ? '0.00' : formatBigDecimals(deposit, 8, false);
    const totalDepositedUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vault.id));
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletConnected(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
      stakedIds,
      isBoosted,
      userStaked,
      hasDeposit,
      totalDeposited,
      totalDepositedUsd,
      blurred,
      loading: !isLoaded,
      variant,
    };
  }
)(
  ({
    stakedIds,
    isBoosted,
    userStaked,
    hasDeposit,
    totalDeposited,
    totalDepositedUsd,
    blurred,
    loading,
    variant,
  }: {
    stakedIds: string;
    isBoosted: boolean;
    userStaked: boolean;
    hasDeposit: boolean;
    totalDeposited: string;
    totalDepositedUsd: string;
    blurred: boolean;
    loading: boolean;
    variant: 'small' | 'large';
  }) => {
    const { t } = useTranslation();

    return (
      <>
        {isBoosted && userStaked && (
          <ValueBlock
            label={t('STAKED-IN')}
            value={stakedIds}
            usdValue={t('BOOST')}
            blurred={blurred}
            loading={loading}
            variant={variant}
          />
        )}
        {(!isBoosted || !userStaked) && (
          <ValueBlock
            label={variant === 'large' ? t('Vault-deposited') : t('DEPOSITED')}
            value={totalDeposited}
            usdValue={hasDeposit ? totalDepositedUsd : null}
            blurred={blurred}
            loading={loading}
            variant={variant}
          />
        )}
      </>
    );
  }
);
export const VaultDeposited = React.memo(_VaultDeposited);
