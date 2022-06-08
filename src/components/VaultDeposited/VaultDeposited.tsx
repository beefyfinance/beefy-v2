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
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';

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
      />
    );
  }
);
const BoostedVaultDepositedLarge = React.memo(_BoostedVaultDepositedLarge);

const _NonBoostedVaultDeposited = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    // deposit can be moo or oracle
    const deposit = isGovVault(vault)
      ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const totalDeposited = formatBigDecimals(deposit, 8, !hasDeposit);
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
      />
    );
  }
);
const NonBoostedVaultDeposited = React.memo(_NonBoostedVaultDeposited);

const _VaultDeposited = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const isBoosted = useAppSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));
  const userStaked = useAppSelector((state: BeefyState) =>
    selectHasUserBalanceInActiveBoost(state, vaultId)
  );

  return isBoosted && userStaked ? (
    <BoostedVaultDepositedLarge vaultId={vaultId} />
  ) : (
    <NonBoostedVaultDeposited vaultId={vaultId} />
  );
};
export const VaultDeposited = React.memo(_VaultDeposited);
