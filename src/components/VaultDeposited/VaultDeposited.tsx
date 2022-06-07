import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { isGovVault, VaultEntity } from '../../features/data/entities/vault';
import {
  selectGovVaultUserStackedBalanceInDepositToken,
  selectHasUserBalanceInActiveBoost,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserVaultDepositInUsd,
} from '../../features/data/selectors/balance';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
} from '../../features/data/selectors/boosts';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';

const _BoostedVaultDepositedSmall = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const stakedIds = selectActiveVaultBoostIds(state, vault.id)
      .map(boostId => {
        const boost = selectBoostById(state, boostId);
        return boost.name;
      })
      .join(', ');
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
      stakedIds,
      blurred,
      loading: !isLoaded,
    };
  }
)(({ stakedIds, blurred, loading }: { stakedIds: string; blurred: boolean; loading: boolean }) => {
  const { t } = useTranslation();

  return (
    <ValueBlock
      label={t('STAKED-IN')}
      value={stakedIds}
      usdValue={t('BOOST')}
      blurred={blurred}
      loading={loading}
      variant="small"
    />
  );
});
const BoostedVaultDepositedSmall = React.memo(_BoostedVaultDepositedSmall);

const _BoostedVaultDepositedLarge = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    // deposit can be moo or oracle
    const deposit = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const totalDeposited = deposit.isZero() ? '0.00' : formatBigDecimals(deposit, 8, false);
    const totalDepositedUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vault.id));
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
      hasDeposit,
      totalDeposited,
      totalDepositedUsd,
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    hasDeposit,
    totalDeposited,
    totalDepositedUsd,
    blurred,
    loading,
  }: {
    hasDeposit: boolean;
    totalDeposited: string;
    totalDepositedUsd: string;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-deposited')}
        value={totalDeposited}
        usdValue={hasDeposit ? totalDepositedUsd : null}
        blurred={blurred}
        loading={loading}
        variant="large"
      />
    );
  }
);
const BoostedVaultDepositedLarge = React.memo(_BoostedVaultDepositedLarge);

const _NonBoostedVaultDeposited = connect(
  (
    state: BeefyState,
    { vaultId, variant }: { vaultId: VaultEntity['id']; variant: 'small' | 'large' }
  ) => {
    const vault = selectVaultById(state, vaultId);
    // deposit can be moo or oracle
    const deposit = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const totalDeposited =
      !hasDeposit && variant === 'large' ? '0.00' : formatBigDecimals(deposit, 8, !hasDeposit);
    const totalDepositedUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vault.id));
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
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
    hasDeposit,
    totalDeposited,
    totalDepositedUsd,
    blurred,
    loading,
    variant,
  }: {
    hasDeposit: boolean;
    totalDeposited: string;
    totalDepositedUsd: string;
    blurred: boolean;
    loading: boolean;
    variant: 'small' | 'large';
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={variant === 'large' ? t('Vault-deposited') : t('DEPOSITED')}
        value={totalDeposited}
        usdValue={hasDeposit ? totalDepositedUsd : null}
        blurred={blurred}
        loading={loading}
        variant={variant}
      />
    );
  }
);
const NonBoostedVaultDeposited = React.memo(_NonBoostedVaultDeposited);

const _VaultDeposited = ({
  vaultId,
  variant,
}: {
  vaultId: VaultEntity['id'];
  variant: 'small' | 'large';
}) => {
  const isBoosted = useAppSelector(state => selectIsVaultBoosted(state, vaultId));
  const userStaked = useAppSelector(state => selectHasUserBalanceInActiveBoost(state, vaultId));

  return isBoosted && userStaked ? (
    variant === 'large' ? (
      <BoostedVaultDepositedLarge vaultId={vaultId} />
    ) : (
      <BoostedVaultDepositedSmall vaultId={vaultId} />
    )
  ) : (
    <NonBoostedVaultDeposited vaultId={vaultId} variant={variant} />
  );
};
export const VaultDeposited = React.memo(_VaultDeposited);
