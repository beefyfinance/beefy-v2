import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { isGovVault, VaultEntity } from '../../features/data/entities/vault';
import {
  selectGovVaultUserStakedBalanceInDepositToken,
  selectHasUserBalanceInActiveBoost,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserVaultDepositInUsd,
} from '../../features/data/selectors/balance';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import { TokenEntity } from '../../features/data/entities/token';
import BigNumber from 'bignumber.js';
import { TokenAmountFromEntity } from '../TokenAmount';

const _BoostedVaultDepositedLarge = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    // deposit can be moo or oracle
    const deposit = isGovVault(vault)
      ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vaultId));
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
      hasDeposit,
      deposit,
      depositUsd,
      depositToken,
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    hasDeposit,
    deposit,
    depositUsd,
    depositToken,
    blurred,
    loading,
  }: {
    hasDeposit: boolean;
    deposit: BigNumber;
    depositUsd: string;
    depositToken: TokenEntity;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-deposited')}
        value={<TokenAmountFromEntity amount={deposit} token={depositToken} minShortPlaces={4} />}
        usdValue={hasDeposit ? depositUsd : null}
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
      ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
      : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);
    const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vaultId));
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
        ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
        : true;
    return {
      hasDeposit,
      deposit,
      depositUsd,
      depositToken,
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    hasDeposit,
    deposit,
    depositUsd,
    depositToken,
    blurred,
    loading,
  }: {
    hasDeposit: boolean;
    deposit: BigNumber;
    depositUsd: string;
    depositToken: TokenEntity;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-deposited')}
        value={<TokenAmountFromEntity amount={deposit} token={depositToken} minShortPlaces={4} />}
        usdValue={hasDeposit ? depositUsd : null}
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
